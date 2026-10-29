-- These seeded records are certificate blueprint areas or unused sample
-- specialties. Preserve content and certificate links as historical records.
-- Do not deactivate newly added custom specialties.
UPDATE domains SET is_active = false, updated_at = NOW()
WHERE code IN ('AWS_CLF_C02_D1', 'AWS_CLF_C02_D2', 'AWS_CLF_C02_D3',
  'AWS_CLF_C02_D4', 'DATA_ENG', 'DATA_SCI', 'DEVOPS', 'NETWORKING')
  AND is_active = true;
