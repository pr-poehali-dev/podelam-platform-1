"""
Универсальное ядро PRO-симулятора жизненных решений.
Один движок считает любые типы: недвижимость, работа, бизнес, кредит, авто, переезд, инвестиции, образование.
"""

AVERAGE_INCOME = 80_000
STANDARD_WORK_HOURS_YEAR = 2000
TOTAL_HOURS_YEAR = 8760
MAX_FREE_TIME = 4380

DEFAULT_INFLATION = 0.07
DEFAULT_DAYS_IN_MONTH = 30
DEFAULT_WORK_HOURS_MONTH = 160


def annuity_payment(principal, annual_rate, months):
    if principal <= 0 or months <= 0:
        return 0.0
    if annual_rate <= 0:
        return principal / months
    r = annual_rate / 12
    return principal * r * (1 + r) ** months / ((1 + r) ** months - 1)


def annuity_remaining_debt(principal, annual_rate, total_months, months_paid):
    if months_paid >= total_months:
        return 0.0
    if annual_rate <= 0:
        return max(0, principal * (1 - months_paid / total_months))
    r = annual_rate / 12
    payment = principal * r * (1 + r) ** total_months / ((1 + r) ** total_months - 1)
    remaining = principal * (1 + r) ** months_paid - payment * ((1 + r) ** months_paid - 1) / r
    return max(0.0, remaining)


def p(params, key, default=0):
    v = params.get(key)
    if v is None or v == '' or v == 'null':
        return default
    return float(v)


def calculate_income(params, year):
    monthly = p(params, 'monthly_income', 0) or p(params, 'income', 100000)
    growth = p(params, 'income_growth_rate', 0) or p(params, 'income_growth', 0.05)
    return monthly * 12 * (1 + growth) ** year


def calculate_expenses(params, year, extra_annual=0):
    monthly = p(params, 'monthly_expenses', 0) or p(params, 'expenses', 70000)
    inflation = p(params, 'inflation_rate', 0) or p(params, 'inflation', DEFAULT_INFLATION)
    return monthly * 12 * (1 + inflation) ** year + extra_annual


def calculate_risk_probability(params):
    return p(params, 'risk_coefficient', 0) or p(params, 'risk_probability', 0.05)


def calculate_time(params):
    work = p(params, 'work_hours_week', 40) * 52
    commute = p(params, 'commute_hours_week', 0) * 52
    free = TOTAL_HOURS_YEAR - work - commute
    stress_coeff = p(params, 'stress_coefficient', 0) or p(params, 'stress_coeff', 1.0)
    workload = work / STANDARD_WORK_HOURS_YEAR
    stress_index = min(10, workload * stress_coeff * 5)
    return work, commute, free, stress_index


def calculate_life_index(expected_income_monthly, free_time, stress_index):
    income_score = min(3.0, expected_income_monthly / AVERAGE_INCOME)
    free_time_score = min(3.0, free_time / MAX_FREE_TIME * 3)
    stress_score = stress_index / 10 * 3
    return max(0, min(10, (income_score + free_time_score - stress_score) * 10 / 3))


# ──────────── EconomicMetrics ────────────

def calculate_daily_budget(monthly_income, monthly_expenses, days_in_month=DEFAULT_DAYS_IN_MONTH):
    daily_income = monthly_income / days_in_month
    daily_expenses = monthly_expenses / days_in_month
    monthly_free = monthly_income - monthly_expenses
    daily_free = monthly_free / days_in_month
    return {
        'daily_income': round(daily_income),
        'daily_expenses': round(daily_expenses),
        'daily_free_budget': round(daily_free),
    }


def calculate_real_capital(nominal_capital, inflation_rate, year):
    if year <= 0:
        return nominal_capital
    return nominal_capital / (1 + inflation_rate) ** year


def calculate_safety_months(capital, monthly_expenses):
    if monthly_expenses <= 0:
        return 999.0
    return capital / monthly_expenses


def calculate_life_hour_value(monthly_income, work_hours_month=DEFAULT_WORK_HOURS_MONTH):
    if work_hours_month <= 0:
        return 0.0
    return monthly_income / work_hours_month


def calculate_daily_cost_projection(monthly_expenses, inflation_rate, days_in_month=DEFAULT_DAYS_IN_MONTH, max_years=30):
    cost_today = monthly_expenses / days_in_month
    projection = []
    for y in [1, 5, 10, 15, 20, 25, 30]:
        if y <= max_years:
            projection.append({
                'year': y,
                'daily_cost': round(cost_today * (1 + inflation_rate) ** y),
            })
    return projection


def build_economic_summary(params, final_yearly, period):
    monthly_income = p(params, 'monthly_income', 0) or p(params, 'income', 100000)
    monthly_expenses = p(params, 'monthly_expenses', 0) or p(params, 'expenses', 70000)
    inflation = p(params, 'inflation_rate', 0) or p(params, 'inflation', DEFAULT_INFLATION)
    income_growth = p(params, 'income_growth_rate', 0) or p(params, 'income_growth', 0.05)
    days_in_month = DEFAULT_DAYS_IN_MONTH
    work_hours_month = DEFAULT_WORK_HOURS_MONTH

    nominal_capital = final_yearly.get('capital', 0) if final_yearly else 0
    real_cap = calculate_real_capital(nominal_capital, inflation, period)

    daily = calculate_daily_budget(monthly_income, monthly_expenses, days_in_month)

    cost_of_life_day = round(monthly_expenses / days_in_month)

    life_hour = calculate_life_hour_value(monthly_income, work_hours_month)

    safety_m = calculate_safety_months(max(0, nominal_capital), monthly_expenses)
    safety_d = safety_m * days_in_month

    real_income_growth = income_growth - inflation

    projection = calculate_daily_cost_projection(monthly_expenses, inflation, days_in_month, period)

    return {
        'daily_income': daily['daily_income'],
        'daily_expenses': daily['daily_expenses'],
        'daily_free_budget': daily['daily_free_budget'],
        'cost_of_life_day': cost_of_life_day,
        'life_hour_value': round(life_hour),
        'safety_months': round(safety_m, 1),
        'safety_days': round(safety_d),
        'nominal_capital': round(nominal_capital),
        'real_capital': round(real_cap),
        'real_income_growth': round(real_income_growth, 4),
        'daily_cost_projection': projection,
    }


# ──────────── Типоспецифичные расширения ────────────

def prep_real_estate(params):
    price = p(params, 'property_price', 0) or p(params, 'asset_cost', 0)
    down = p(params, 'down_payment', 0)
    rate = p(params, 'mortgage_rate', 0) or p(params, 'credit_rate', 0.12)
    years = p(params, 'mortgage_years', 0)
    months = int(years * 12) if years > 0 else int(p(params, 'credit_months', 240))
    principal = p(params, 'credit_principal', 0) or max(0, price - down)
    growth = p(params, 'property_growth_rate', 0) or p(params, 'asset_growth', 0.05)
    maint = p(params, 'maintenance_rate', 0.01)
    tax = p(params, 'tax_rate', 0.001)
    rent = p(params, 'rent_cost', 0)
    return {
        'asset_cost': price, 'credit_principal': principal,
        'credit_rate': rate, 'credit_months': months,
        'asset_growth': growth, 'maintenance_rate': maint, 'tax_rate': tax,
        'rent_cost': rent,
    }


def prep_car(params):
    price = p(params, 'car_price', 0) or p(params, 'asset_cost', 0)
    fuel = p(params, 'fuel_cost_month', 0)
    insurance = p(params, 'insurance_year', 0)
    maint = p(params, 'maintenance_year', 0)
    depr = p(params, 'depreciation_rate', 0.10)
    principal = p(params, 'credit_principal', 0)
    rate = p(params, 'credit_rate', 0.20)
    months = int(p(params, 'credit_months', 60))
    return {
        'asset_cost': price, 'asset_growth': -depr,
        'extra_annual': fuel * 12 + insurance + maint,
        'credit_principal': principal, 'credit_rate': rate, 'credit_months': months,
    }


def prep_business(params):
    startup = p(params, 'startup_investment', 0)
    revenue = p(params, 'monthly_revenue', 0)
    biz_exp = p(params, 'monthly_business_expenses', 0)
    rev_growth = p(params, 'revenue_growth_rate', 0.15)
    success = p(params, 'success_probability', 0.7)
    return {
        'startup_investment': startup,
        'monthly_revenue': revenue, 'monthly_business_expenses': biz_exp,
        'revenue_growth_rate': rev_growth, 'success_probability': success,
    }


def prep_relocation(params):
    cur_salary = p(params, 'current_salary', 0) or p(params, 'income', 100000)
    new_salary = p(params, 'new_city_salary', 0)
    cur_cost = p(params, 'current_cost_living', 0) or p(params, 'expenses', 70000)
    new_cost = p(params, 'new_cost_living', 0)
    reloc_cost = p(params, 'relocation_cost', 0)
    return {
        'current_salary': cur_salary, 'new_city_salary': new_salary,
        'current_cost_living': cur_cost, 'new_cost_living': new_cost,
        'relocation_cost': reloc_cost,
    }


def prep_career(params):
    cur = p(params, 'current_salary', 0) or p(params, 'income', 100000)
    new = p(params, 'new_salary', 0)
    g_cur = p(params, 'salary_growth_current', 0.04)
    g_new = p(params, 'salary_growth_new', 0.10)
    loss = p(params, 'job_loss_probability', 0.05)
    return {
        'current_salary': cur, 'new_salary': new,
        'salary_growth_current': g_cur, 'salary_growth_new': g_new,
        'job_loss_probability': loss,
    }


def prep_investments(params):
    initial = p(params, 'initial_investment', 0) or p(params, 'start_capital', 0)
    monthly = p(params, 'monthly_investment', 0) or p(params, 'investments', 0)
    ret = p(params, 'investment_return_rate', 0) or p(params, 'invest_return', 0.12)
    vol = p(params, 'volatility', 0)
    return {
        'initial_investment': initial, 'monthly_investment': monthly,
        'invest_return': ret, 'volatility': vol,
    }


# ──────────── Универсальная симуляция ────────────

def simulate_variant(params, period, scenario_type='free'):
    sc = scenario_type or 'free'

    start_capital = p(params, 'start_capital', 0)
    risk_prob = calculate_risk_probability(params)
    _, _, free_time, stress_index = calculate_time(params)

    credit_principal = p(params, 'credit_principal', 0)
    credit_rate = p(params, 'credit_rate', 0.18)
    credit_months = int(p(params, 'credit_months', 120))

    asset_cost = p(params, 'asset_cost', 0)
    asset_growth_rate = p(params, 'asset_growth', 0.04)

    invest_pmt = p(params, 'investments', 0) or p(params, 'monthly_investment', 0)
    invest_return = p(params, 'invest_return', 0.12) or p(params, 'investment_return_rate', 0.12)
    invest_initial = p(params, 'initial_investment', 0)

    extra_annual = 0
    biz = None
    reloc = None

    if sc == 'real_estate':
        re = prep_real_estate(params)
        asset_cost = re['asset_cost'] or asset_cost
        credit_principal = re['credit_principal'] or credit_principal
        credit_rate = re['credit_rate'] or credit_rate
        credit_months = re['credit_months'] or credit_months
        asset_growth_rate = re['asset_growth']
        extra_annual = asset_cost * (re['maintenance_rate'] + re['tax_rate'])

    elif sc == 'car':
        ca = prep_car(params)
        asset_cost = ca['asset_cost'] or asset_cost
        asset_growth_rate = ca['asset_growth']
        credit_principal = ca['credit_principal'] or credit_principal
        credit_rate = ca['credit_rate'] or credit_rate
        credit_months = ca['credit_months'] or credit_months
        extra_annual = ca['extra_annual']

    elif sc == 'business':
        biz = prep_business(params)
        start_capital -= biz['startup_investment']

    elif sc in ('relocation', 'career'):
        pass

    elif sc == 'investment':
        inv = prep_investments(params)
        invest_pmt = inv['monthly_investment'] or invest_pmt
        invest_return = inv['invest_return'] or invest_return
        invest_initial = inv['initial_investment'] or invest_initial

    monthly_pay = annuity_payment(credit_principal, credit_rate, credit_months)
    annual_debt = monthly_pay * 12

    capital = start_capital
    if asset_cost > 0:
        capital = capital - asset_cost + credit_principal

    invest_portfolio = invest_initial
    inflation = p(params, 'inflation_rate', 0) or p(params, 'inflation', DEFAULT_INFLATION)
    yearly = []

    for year in range(1, period + 1):
        income_annual = calculate_income(params, year)

        if biz and biz['monthly_revenue'] > 0:
            biz_rev = biz['monthly_revenue'] * 12 * (1 + biz['revenue_growth_rate']) ** year
            biz_exp = biz['monthly_business_expenses'] * 12 * (1 + inflation) ** year
            biz_profit = (biz_rev - biz_exp) * biz['success_probability']
            income_annual = income_annual + biz_profit

        expected_income = income_annual * (1 - risk_prob)
        expenses_annual = calculate_expenses(params, year, extra_annual)

        debt_this_year = annual_debt if (year - 1) * 12 < credit_months else 0.0

        invest_portfolio = invest_portfolio * (1 + invest_return) + invest_pmt * 12

        current_asset = asset_cost * (1 + asset_growth_rate) ** year if asset_cost > 0 else 0

        months_paid = min(year * 12, credit_months)
        remaining_debt = annuity_remaining_debt(credit_principal, credit_rate, credit_months, months_paid) if credit_principal > 0 else 0

        savings = expected_income - expenses_annual - debt_this_year
        capital += savings

        total_assets = max(0, capital) + current_asset + invest_portfolio
        net_worth = total_assets - remaining_debt

        work_h, commute_h, free_time, stress_idx = calculate_time(params)
        life_idx = calculate_life_index(expected_income / 12, free_time, stress_idx)

        annual_exp = expenses_annual if expenses_annual > 0 else 1
        fin_stability = capital / annual_exp
        risk_index = min(10, risk_prob * 10 + (debt_this_year / (expected_income + 1)) * 10)

        real_cap = calculate_real_capital(capital, inflation, year)

        yearly.append({
            'year': year,
            'income': round(expected_income),
            'expenses': round(expenses_annual),
            'savings': round(savings),
            'capital': round(capital),
            'invest_portfolio': round(invest_portfolio),
            'asset_value': round(current_asset),
            'net_worth': round(net_worth),
            'debt_remaining': round(remaining_debt),
            'free_time_hours': round(free_time),
            'stress_index': round(stress_idx, 2),
            'life_index': round(life_idx, 2),
            'fin_stability': round(fin_stability, 2),
            'risk_index': round(risk_index, 2),
            'real_capital': round(real_cap),
        })

    final = yearly[-1] if yearly else {}
    income_start = (p(params, 'monthly_income', 0) or p(params, 'income', 100000))
    wealth_index = min(10, max(0, final.get('net_worth', 0) / (income_start * 120 + 1) * 10))
    income_index = min(10, final.get('income', 0) / (AVERAGE_INCOME * 12 + 1) * 5)
    life_f = final.get('life_index', 5)
    risk_f = final.get('risk_index', 5)

    scenario_score = max(0, min(10,
        0.4 * wealth_index + 0.2 * income_index + 0.2 * life_f - 0.2 * risk_f
    ))

    risk_prob_val = risk_prob
    investor_type = 'консервативный' if risk_prob_val < 0.08 else ('сбалансированный' if risk_prob_val < 0.15 else 'рискованный')

    economic_summary = build_economic_summary(params, final, period)

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
            'real_capital': final.get('real_capital', 0),
            'daily_free_budget': economic_summary['daily_free_budget'],
            'cost_of_life_day': economic_summary['cost_of_life_day'],
            'safety_months': economic_summary['safety_months'],
        },
        'economic_summary': economic_summary,
    }


def build_recommendation(variants_results):
    if not variants_results:
        return ''
    best = max(variants_results, key=lambda x: x['final']['scenario_score'])
    worst = min(variants_results, key=lambda x: x['final']['scenario_score'])
    name = best['name']
    score = best['final']['scenario_score']
    nw = best['final']['net_worth']
    nw_fmt = f"{nw / 1_000_000:.1f} млн ₽" if abs(nw) >= 1_000_000 else f"{nw / 1_000:.0f} тыс. ₽"

    parts = [f"Сценарий «{name}» показывает лучший итоговый рейтинг ({score:.1f}/10)."]

    life_idx = best['final']['life_index']
    risk_idx = best['final']['risk_index']
    fin_stab = best['final']['fin_stability']

    if life_idx >= 7:
        parts.append("Высокое качество жизни.")
    elif life_idx >= 5:
        parts.append("Комфортное качество жизни.")
    if risk_idx <= 2:
        parts.append("Риски минимальны.")
    elif risk_idx <= 4:
        parts.append("Риски умеренные.")
    if fin_stab > 3:
        parts.append("Финансовая подушка устойчива.")
    elif fin_stab > 1:
        parts.append("Финансовая подушка на среднем уровне.")

    parts.append(f"Чистый капитал к концу периода: {nw_fmt}.")

    eco = best.get('economic_summary')
    if eco:
        sm = eco.get('safety_months', 0)
        if sm >= 12:
            parts.append(f"Финансовая безопасность: {sm:.0f} мес. запаса.")
        elif sm >= 6:
            parts.append(f"Финансовый запас: {sm:.0f} мес. — достаточно.")
        elif sm >= 0:
            parts.append(f"Запас средств: {sm:.1f} мес. — стоит увеличить подушку.")
        lhv = eco.get('life_hour_value', 0)
        if lhv > 0:
            parts.append(f"Стоимость часа жизни: {lhv:,.0f} ₽.".replace(',', ' '))

    if len(variants_results) > 1 and worst['name'] != best['name']:
        diff = best['final']['net_worth'] - worst['final']['net_worth']
        if diff > 0:
            diff_fmt = f"{diff / 1_000_000:.1f} млн" if diff >= 1_000_000 else f"{diff / 1_000:.0f} тыс."
            parts.append(f"Разница с «{worst['name']}» составляет {diff_fmt} ₽.")

    return " ".join(parts)
