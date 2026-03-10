CREATE TABLE simulator_scenarios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL DEFAULT 'free',
  period INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE simulator_variants (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER NOT NULL REFERENCES simulator_scenarios(id),
  name VARCHAR(255) NOT NULL,
  parameters_json JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE simulator_results (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER NOT NULL REFERENCES simulator_scenarios(id),
  results_json JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_simulator_scenarios_user_id ON simulator_scenarios(user_id);
CREATE INDEX idx_simulator_variants_scenario_id ON simulator_variants(scenario_id);
CREATE INDEX idx_simulator_results_scenario_id ON simulator_results(scenario_id);
