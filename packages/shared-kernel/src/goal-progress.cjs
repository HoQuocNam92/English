const nonnegative = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

/** Targets are goals, not limits: preserve work completed beyond the target. */
function goalProgress(actual, goal, unit) {
  const value = nonnegative(actual);
  const target = nonnegative(goal);
  const remaining = Math.max(0, target - value);
  const exceeded = target > 0 ? Math.max(0, value - target) : 0;
  return {
    value, target, remaining, exceeded,
    percent: target > 0 ? Math.min(100, Math.round(value / target * 100)) : 0,
    status: target <= 0 ? 'Chưa thiết lập mục tiêu' : exceeded > 0 ? `Vượt mục tiêu ${exceeded} ${unit}` : remaining === 0 ? 'Đã đạt mục tiêu' : `Còn ${remaining} ${unit}`,
    description: target > 0 ? `${value} ${unit} đã hoàn thành, mục tiêu ${target} ${unit}` : `${value} ${unit} đã hoàn thành, chưa thiết lập mục tiêu`,
  };
}

module.exports = { goalProgress };
