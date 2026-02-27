UPDATE t_p13403005_podelam_platform_1.trainer_subscriptions
SET sessions_used = (
  SELECT COUNT(*) FROM t_p13403005_podelam_platform_1.trainer_sessions ts
  WHERE ts.user_id = trainer_subscriptions.user_id AND ts.completed_at IS NOT NULL
)
WHERE plan_id = 'basic';