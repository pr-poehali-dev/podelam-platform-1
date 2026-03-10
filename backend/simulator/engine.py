"""
Математическое ядро PRO-симулятора жизненных решений.
Реализует полную модель: капитал, доход, расходы, активы, кредит, инвестиции, риски, время, качество жизни.
"""
import math


AVERAGE_INCOME = 80_000          # ₽/мес — средний доход по РФ для нормализации
STANDARD_WORK_HOURS_YEAR = 1980  # 45 ч/нед × 44 нед
TOTAL_HOURS_YEAR = 8760
MAX_FREE_TIME = 4380             # ~12 ч/день свободного времени потолок


# ─────────────────────────────────────────────
# Вспомогательные формулы
# ─────────────────────────────────────────────

def annuity_payment(principal: float, annual_rate: float, months: int) -> float:
    """Аннуитетный ежемесячный платёж по кредиту."""
    if principal <= 0 or months <= 0:
        return 0.0
    if annual_rate <= 0:
        return principal / months
    r = annual_rate / 12
    return principal * r * (1 + r) ** months / ((1 + r) ** months - 1)


def future_value_lump(p: float, r: float, n: int) -> float:
    """Будущая стоимость единовременного вложения: P × (1+r)^n"""
    if r <= 0:
        return p
    return p * (1 + r) ** n


def future_value_annuity(pmt: float, r: float, n: int) -> float:
    """Будущая стоимость регулярных пополнений: PMT × ((1+r)^n - 1) / r"""
    if pmt <= 0 or n <= 0:
        return 0.0
    if r <= 0:
        return pmt * n
    return pmt * ((1 + r) ** n - 1) / r


# ─────────────────────────────────────────────
# Основная симуляция одного варианта
# ─────────────────────────────────────────────

def simulate_variant(params: dict, period: int) -> dict:
    """
    Симулирует один вариант сценария по годам.
    Возвращает словарь с погодовой динамикой и итоговыми показателями.
    """
    # --- Входные параметры ---
    income_start      = float(params.get('income', 100_000))          # ₽/мес
    expenses_start    = float(params.get('expenses', 70_000))         # ₽/мес
    start_capital     = float(params.get('start_capital', 0))         # стартовый капитал ₽
    asset_cost        = float(params.get('asset_cost', 0))            # стоимость актива ₽
    asset_growth      = float(params.get('asset_growth', 0.04))       # рост актива/год (доля)
    credit_principal  = float(params.get('credit_principal', 0))      # сумма кредита ₽
    credit_rate       = float(params.get('credit_rate', 0.18))        # ставка кредита/год
    credit_months     = int(params.get('credit_months', 120))         # срок кредита в месяцах
    investments_pmt   = float(params.get('investments', 0))           # ежемесячные инвестиции ₽
    invest_return     = float(params.get('invest_return', 0.12))      # доходность инвестиций/год
    income_growth     = float(params.get('income_growth', 0.05))      # рост дохода/год
    inflation         = float(params.get('inflation', 0.07))          # инфляция/год
    work_hours_week   = float(params.get('work_hours_week', 40))      # рабочих часов в неделю
    commute_hours_week= float(params.get('commute_hours_week', 0))    # дорога на работу ч/нед
    stress_coeff      = float(params.get('stress_coeff', 1.0))        # коэффициент стресса 0.5–2.0
    risk_probability  = float(params.get('risk_probability', 0.05))   # вероятность потери дохода/год

    # Аннуитет (считается один раз)
    monthly_payment = annuity_payment(credit_principal, credit_rate, credit_months)
    annual_debt_payment = monthly_payment * 12

    # Начальный актив
    current_asset_value = asset_cost

    # Инвестиционный портфель (накопленная стоимость, отдельно от капитала)
    invest_portfolio = 0.0

    capital = start_capital - asset_cost + credit_principal  # если актив куплен в кредит

    yearly = []

    for year in range(1, period + 1):
        # Доход этого года (с учётом роста и риска)
        income_year = income_start * (1 + income_growth) ** year
        expected_income = income_year * (1 - risk_probability)

        # Расходы этого года (растут с инфляцией)
        expenses_year = expenses_start * (1 + inflation) ** year

        # Кредитные выплаты в этом году
        debt_paid_this_year = annual_debt_payment if (year - 1) * 12 < credit_months else 0.0

        # Инвестиции: пополняем и считаем рост
        invest_portfolio = invest_portfolio * (1 + invest_return) + investments_pmt * 12

        # Актив растёт
        current_asset_value = asset_cost * (1 + asset_growth) ** year

        # Остаток долга по кредиту
        months_paid = min(year * 12, credit_months)
        if credit_principal > 0 and credit_months > 0:
            remaining_debt = annuity_remaining_debt(credit_principal, credit_rate, credit_months, months_paid)
        else:
            remaining_debt = 0.0

        # Капитал (ликвидный)
        savings_this_year = (expected_income - expenses_year) * 12 - debt_paid_this_year
        capital += savings_this_year

        # Чистые активы
        total_assets = max(0, capital) + current_asset_value + invest_portfolio
        net_worth = total_assets - remaining_debt

        # --- Время ---
        work_hours_year = work_hours_week * 52
        commute_hours_year = commute_hours_week * 52
        free_time = TOTAL_HOURS_YEAR - work_hours_year - commute_hours_year

        # --- Стресс ---
        workload = work_hours_year / STANDARD_WORK_HOURS_YEAR
        stress_index = min(10, workload * stress_coeff * 5)

        # --- Индекс качества жизни ---
        income_score = min(3.0, expected_income / AVERAGE_INCOME)
        free_time_score = min(3.0, free_time / MAX_FREE_TIME * 3)
        stress_score = stress_index / 10 * 3
        life_index = max(0, min(10, (income_score + free_time_score - stress_score) * 10 / 3))

        # --- Финансовая устойчивость ---
        annual_expenses_total = expenses_year * 12
        fin_stability = capital / annual_expenses_total if annual_expenses_total > 0 else 0

        # --- Индекс риска ---
        risk_index = min(10, risk_probability * 10 + (debt_paid_this_year / (expected_income * 12 + 1)) * 10)

        yearly.append({
            'year': year,
            'income': round(expected_income * 12),
            'expenses': round(expenses_year * 12),
            'savings': round(savings_this_year),
            'capital': round(capital),
            'invest_portfolio': round(invest_portfolio),
            'asset_value': round(current_asset_value),
            'net_worth': round(net_worth),
            'debt_remaining': round(remaining_debt),
            'free_time_hours': round(free_time),
            'stress_index': round(stress_index, 2),
            'life_index': round(life_index, 2),
            'fin_stability': round(fin_stability, 2),
            'risk_index': round(risk_index, 2),
        })

    final = yearly[-1] if yearly else {}

    # --- Итоговый рейтинг сценария ---
    wealth_index = min(10, max(0, final.get('net_worth', 0) / (income_start * 120) * 10))
    income_index = min(10, final.get('income', 0) / (AVERAGE_INCOME * 12) * 5)
    life_idx_final = final.get('life_index', 5)
    risk_idx_final = final.get('risk_index', 5)

    scenario_score = (
        0.4 * wealth_index
        + 0.2 * income_index
        + 0.2 * life_idx_final
        - 0.2 * risk_idx_final
    )

    # Тип инвестора
    risk_share = risk_probability
    if risk_share < 0.3:
        investor_type = 'консервативный'
    elif risk_share < 0.6:
        investor_type = 'сбалансированный'
    else:
        investor_type = 'рискованный'

    return {
        'yearly': yearly,
        'final': {
            'net_worth': final.get('net_worth', 0),
            'capital': final.get('capital', 0),
            'invest_portfolio': final.get('invest_portfolio', 0),
            'asset_value': final.get('asset_value', 0),
            'total_income': sum(y['income'] for y in yearly),
            'total_expenses': sum(y['expenses'] for y in yearly),
            'total_savings': sum(y['savings'] for y in yearly),
            'debt_remaining': final.get('debt_remaining', 0),
            'life_index': final.get('life_index', 0),
            'stress_index': final.get('stress_index', 0),
            'free_time_hours': final.get('free_time_hours', 0),
            'fin_stability': final.get('fin_stability', 0),
            'risk_index': final.get('risk_index', 0),
            'scenario_score': round(scenario_score, 2),
            'investor_type': investor_type,
        }
    }


def annuity_remaining_debt(principal: float, annual_rate: float, total_months: int, months_paid: int) -> float:
    """Остаток долга по аннуитетному кредиту после months_paid выплат."""
    if annual_rate <= 0:
        return max(0, principal * (1 - months_paid / total_months))
    r = annual_rate / 12
    payment = principal * r * (1 + r) ** total_months / ((1 + r) ** total_months - 1)
    remaining = principal * (1 + r) ** months_paid - payment * ((1 + r) ** months_paid - 1) / r
    return max(0.0, remaining)


def build_recommendation(variants_results: list) -> str:
    """Формирует итоговый вывод на основе рейтингов сценариев."""
    if not variants_results:
        return ''
    best = max(variants_results, key=lambda x: x['final']['scenario_score'])
    best_name = best['name']
    score = best['final']['scenario_score']
    nw = best['final']['net_worth']

    nw_fmt = f"{nw / 1_000_000:.1f} млн ₽" if abs(nw) >= 1_000_000 else f"{nw / 1_000:.0f} тыс. ₽"

    parts = [f"Сценарий «{best_name}» показывает лучший итоговый рейтинг ({score:.1f}/10)."]

    life_idx = best['final']['life_index']
    risk_idx = best['final']['risk_index']
    fin_stab = best['final']['fin_stability']

    if life_idx >= 7:
        parts.append("Высокое качество жизни.")
    if risk_idx <= 3:
        parts.append("Риски минимальны.")
    if fin_stab > 3:
        parts.append("Финансовая подушка устойчива.")
    parts.append(f"Чистый капитал к концу периода: {nw_fmt}.")

    return " ".join(parts)
