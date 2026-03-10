"""
API симулятора жизненных решений.
Управление сценариями: создание, редактирование, запуск симуляции, получение результатов.
"""
import json
import os
import psycopg2
from engine import simulate_variant, build_recommendation


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

MAX_SCENARIOS_PRO = 20
MAX_VARIANTS = 3


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data, status=200):
    return {'statusCode': status, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    """Симулятор жизненных решений — основной API"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    user_id = params.get('user_id') or body.get('user_id')
    if not user_id:
        return err('user_id required', 401)
    user_id = int(user_id)

    conn = get_conn()
    cur = conn.cursor()

    try:
        # Получить список сценариев
        if action == 'list' and method == 'GET':
            cur.execute(
                "SELECT id, title, type, period, created_at, updated_at FROM simulator_scenarios WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            scenarios = []
            for r in rows:
                sc_id = r[0]
                cur.execute("SELECT id, name, parameters_json FROM simulator_variants WHERE scenario_id = %s ORDER BY id", (sc_id,))
                variants = [{'id': v[0], 'name': v[1], 'parameters': v[2] or {}} for v in cur.fetchall()]
                cur.execute("SELECT id, results_json, created_at FROM simulator_results WHERE scenario_id = %s ORDER BY created_at DESC LIMIT 1", (sc_id,))
                res = cur.fetchone()
                last_result = {'id': res[0], 'results': res[1], 'created_at': res[2]} if res else None
                scenarios.append({'id': sc_id, 'title': r[1], 'type': r[2], 'period': r[3], 'created_at': r[4], 'updated_at': r[5], 'variants': variants, 'last_result': last_result})
            return ok({'scenarios': scenarios})

        # Создать сценарий
        if action == 'create' and method == 'POST':
            cur.execute("SELECT COUNT(*) FROM simulator_scenarios WHERE user_id = %s", (user_id,))
            count = cur.fetchone()[0]
            if count >= MAX_SCENARIOS_PRO:
                return err(f'Достигнут лимит {MAX_SCENARIOS_PRO} сценариев', 403)
            title = body.get('title', 'Новый сценарий')
            sc_type = body.get('type', 'free')
            period = int(body.get('period', 10))
            cur.execute(
                "INSERT INTO simulator_scenarios (user_id, title, type, period) VALUES (%s, %s, %s, %s) RETURNING id",
                (user_id, title, sc_type, period)
            )
            sc_id = cur.fetchone()[0]
            variants = body.get('variants', [])
            for i, v in enumerate(variants[:MAX_VARIANTS]):
                cur.execute(
                    "INSERT INTO simulator_variants (scenario_id, name, parameters_json) VALUES (%s, %s, %s)",
                    (sc_id, v.get('name', f'Сценарий {chr(65+i)}'), json.dumps(v.get('parameters', {})))
                )
            conn.commit()
            return ok({'id': sc_id, 'message': 'Сценарий создан'}, 201)

        # Обновить сценарий
        if action == 'update' and method == 'POST':
            sc_id = int(body.get('scenario_id', 0))
            cur.execute("SELECT id FROM simulator_scenarios WHERE id = %s AND user_id = %s", (sc_id, user_id))
            if not cur.fetchone():
                return err('Сценарий не найден', 404)
            title = body.get('title')
            period = body.get('period')
            sc_type = body.get('type')
            if title:
                cur.execute("UPDATE simulator_scenarios SET title = %s, updated_at = NOW() WHERE id = %s", (title, sc_id))
            if period:
                cur.execute("UPDATE simulator_scenarios SET period = %s, updated_at = NOW() WHERE id = %s", (int(period), sc_id))
            if sc_type:
                cur.execute("UPDATE simulator_scenarios SET type = %s, updated_at = NOW() WHERE id = %s", (sc_type, sc_id))
            variants = body.get('variants')
            if variants is not None:
                cur.execute("DELETE FROM simulator_variants WHERE scenario_id = %s", (sc_id,))
                for i, v in enumerate(variants[:MAX_VARIANTS]):
                    cur.execute(
                        "INSERT INTO simulator_variants (scenario_id, name, parameters_json) VALUES (%s, %s, %s)",
                        (sc_id, v.get('name', f'Сценарий {chr(65+i)}'), json.dumps(v.get('parameters', {})))
                    )
            conn.commit()
            return ok({'message': 'Сценарий обновлён'})

        # Запустить симуляцию
        if action == 'run' and method == 'POST':
            sc_id = int(body.get('scenario_id', 0))
            cur.execute("SELECT id, title, period, type FROM simulator_scenarios WHERE id = %s AND user_id = %s", (sc_id, user_id))
            sc = cur.fetchone()
            if not sc:
                return err('Сценарий не найден', 404)
            cur.execute("SELECT id, name, parameters_json FROM simulator_variants WHERE scenario_id = %s ORDER BY id", (sc_id,))
            db_variants = cur.fetchall()
            period = sc[2]
            sc_type = sc[3] or 'free'

            variants_results = []
            for v in db_variants:
                sim = simulate_variant(v[2] or {}, period, sc_type)
                variants_results.append({
                    'variant_id': v[0],
                    'name': v[1],
                    'final': sim['final'],
                    'yearly': sim['yearly'],
                })

            recommendation = build_recommendation(variants_results)
            results_data = {
                'period': period,
                'variants': variants_results,
                'recommendation': recommendation,
            }

            cur.execute(
                "INSERT INTO simulator_results (scenario_id, results_json) VALUES (%s, %s) RETURNING id",
                (sc_id, json.dumps(results_data, ensure_ascii=False))
            )
            res_id = cur.fetchone()[0]
            cur.execute("UPDATE simulator_scenarios SET updated_at = NOW() WHERE id = %s", (sc_id,))
            conn.commit()
            return ok({'result_id': res_id, 'results': results_data})

        # Получить результат
        if action == 'get_result' and method == 'GET':
            sc_id = params.get('scenario_id')
            result_id = params.get('result_id')
            if result_id:
                cur.execute("SELECT r.id, r.results_json, r.created_at FROM simulator_results r JOIN simulator_scenarios s ON s.id = r.scenario_id WHERE r.id = %s AND s.user_id = %s", (int(result_id), user_id))
            else:
                cur.execute("SELECT r.id, r.results_json, r.created_at FROM simulator_results r JOIN simulator_scenarios s ON s.id = r.scenario_id WHERE r.scenario_id = %s AND s.user_id = %s ORDER BY r.created_at DESC LIMIT 1", (int(sc_id), user_id))
            row = cur.fetchone()
            if not row:
                return err('Результат не найден', 404)
            return ok({'id': row[0], 'results': row[1], 'created_at': row[2]})

        # Удалить сценарий
        if action == 'delete' and method == 'POST':
            sc_id = int(body.get('scenario_id', 0))
            cur.execute("SELECT id FROM simulator_scenarios WHERE id = %s AND user_id = %s", (sc_id, user_id))
            if not cur.fetchone():
                return err('Сценарий не найден', 404)
            cur.execute("UPDATE simulator_results SET results_json = '{}' WHERE scenario_id = %s", (sc_id,))
            cur.execute("UPDATE simulator_variants SET parameters_json = '{}' WHERE scenario_id = %s", (sc_id,))
            cur.execute("UPDATE simulator_scenarios SET title = '[удалён]', updated_at = NOW() WHERE id = %s", (sc_id,))
            conn.commit()
            return ok({'message': 'Сценарий удалён'})

        return err('Неизвестное действие', 400)

    finally:
        cur.close()
        conn.close()