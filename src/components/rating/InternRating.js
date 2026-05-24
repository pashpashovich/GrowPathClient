import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Star,
  FormatQuote,
  AssignmentTurnedIn,
  Schedule,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRatingProfileAsync } from '../../store/slices/ratingSlice';
import { unwrapRatingProfile } from '../../utils/apiResponse';

const CARD_SX = {
  p: 3,
  borderRadius: 3,
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  height: '100%',
};

const RATING_MAX = 10;

function formatRating(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toFixed(1);
}

function ratingPercent(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, (n / RATING_MAX) * 100));
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTrendIcon(trend) {
  switch (trend) {
    case 'up':
      return <TrendingUp sx={{ color: 'success.main' }} />;
    case 'down':
      return <TrendingDown sx={{ color: 'error.main' }} />;
    default:
      return <TrendingFlat sx={{ color: 'text.secondary' }} />;
  }
}

function getTrendLabel(trend) {
  switch (trend) {
    case 'up':
      return 'Растёт';
    case 'down':
      return 'Снижается';
    default:
      return 'Стабильно';
  }
}

function formatCohortDelta(delta) {
  const n = Number(delta);
  if (Number.isNaN(n) || Math.abs(n) < 0.05) return 'На уровне среднего';
  const abs = Math.abs(n).toFixed(1);
  return n > 0 ? `Выше среднего на ${abs}` : `Ниже среднего на ${abs}`;
}

/** Есть оценки по задачам, даже если итоговая оценка стажировки ещё не выставлена */
function hasTaskRatingData(profile) {
  if (!profile) return false;
  const tasks = profile.tasks ?? profile.taskStats ?? {};
  const recentRatedTasks =
    profile.recentRatedTasks ?? profile.recent_rated_tasks ?? [];
  if (recentRatedTasks.length > 0) return true;
  if (Number(tasks.ratedTasksCount) > 0) return true;
  if (tasks.averageTaskRating != null && !Number.isNaN(Number(tasks.averageTaskRating))) {
    return true;
  }
  return Number(tasks.completed) > 0;
}

function hasFormalAssessment(profile) {
  if (!profile) return false;
  if (profile.hasAssessment === true) return true;
  const current = profile.current;
  return current != null && current.overallRating != null;
}

function RatingBar({ label, value, color = 'primary' }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {formatRating(value)} / {RATING_MAX}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={ratingPercent(value)}
        color={color}
        sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
      />
    </Box>
  );
}

function KpiTile({ label, value, sub }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
      <Typography variant="h5" fontWeight={700} color="primary.main">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
      {sub ? (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      ) : null}
    </Paper>
  );
}

const InternRating = ({ refreshKey }) => {
  const dispatch = useDispatch();
  const { ratingProfile, isProfileLoading, profileError } = useSelector((state) => state.rating || {});

  useEffect(() => {
    dispatch(
      fetchRatingProfileAsync({
        historyLimit: 12,
        recentTasksLimit: 5,
      })
    );
  }, [dispatch, refreshKey]);

  const profile = useMemo(
    () => unwrapRatingProfile(ratingProfile),
    [ratingProfile]
  );

  const chartData = useMemo(() => {
    const history = profile?.history ?? [];
    return history.map((point, index) => ({
      key: point.assessmentId ?? index,
      label: formatDate(point.date),
      rating: Number(point.overallRating) || 0,
    }));
  }, [profile?.history]);

  const trendDelta = useMemo(() => {
    const current = profile?.current;
    if (current?.previousRating != null && current?.overallRating != null) {
      const diff = Number(current.overallRating) - Number(current.previousRating);
      if (!Number.isNaN(diff) && Math.abs(diff) >= 0.05) {
        const sign = diff > 0 ? '+' : '';
        return `${sign}${diff.toFixed(1)} к прошлой оценке`;
      }
    }
    return null;
  }, [profile?.current]);

  if (isProfileLoading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (profileError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {profileError}
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Не удалось загрузить профиль рейтинга. Обновите страницу.
      </Alert>
    );
  }

  const {
    current,
    cohort,
    tasks: tasksRaw,
    programName,
  } = profile;
  const tasks = tasksRaw ?? profile.taskStats ?? {};
  const recentRatedTasks =
    profile.recentRatedTasks ?? profile.recent_rated_tasks ?? [];

  const showTaskRatings = hasTaskRatingData(profile);
  const showFormalAssessment = hasFormalAssessment(profile);

  if (!showFormalAssessment && !showTaskRatings) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Мой рейтинг
        </Typography>
        {programName && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {programName}
          </Typography>
        )}
        <Paper sx={{ ...CARD_SX, textAlign: 'center', py: 8 }}>
          <Star sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Оценка ещё не выставлена
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
            Когда ментор проведёт оценку по итогам стажировки или оценит выполненные задачи,
            здесь появятся рейтинг и статистика.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Мой рейтинг
        </Typography>
        {programName && (
          <Typography variant="body1" color="text.secondary">
            {programName}
          </Typography>
        )}
      </Box>

      {!showFormalAssessment && showTaskRatings && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Итоговая оценка по стажировке ещё не выставлена. Ниже — оценки по выполненным задачам.
        </Alert>
      )}

      <Grid container spacing={3}>
        {!showFormalAssessment && showTaskRatings && (
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={CARD_SX}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                Средняя оценка по задачам
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 0.5 }}>
                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{ fontSize: { xs: '2.75rem', md: '3.5rem' }, lineHeight: 1 }}
                >
                  {formatRating(tasks?.averageTaskRating)}
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                  / {RATING_MAX}
                </Typography>
              </Box>
              {tasks?.ratedTasksCount != null && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  На основе {tasks.ratedTasksCount} оценённых задач
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {showFormalAssessment && (
        <>
        {/* Hero + dimensions */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={CARD_SX}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Общий рейтинг
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 0.5 }}>
                  <Typography
                    variant="h2"
                    fontWeight={800}
                    sx={{ fontSize: { xs: '2.75rem', md: '3.5rem' }, lineHeight: 1 }}
                  >
                    {formatRating(current?.overallRating)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" fontWeight={500}>
                    / {RATING_MAX}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                  {getTrendIcon(current?.trend)}
                  <Typography variant="body2" color="text.secondary">
                    {getTrendLabel(current?.trend)}
                    {trendDelta ? ` · ${trendDelta}` : ''}
                  </Typography>
                </Stack>
              </Box>
              {cohort?.rank != null && cohort?.cohortSize != null && (
                <Chip
                  icon={<Star />}
                  label={`${cohort.rank} из ${cohort.cohortSize}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            {cohort && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {formatCohortDelta(cohort.deltaFromAverage)}
                {cohort.averageOverallRating != null && (
                  <> · среднее по группе {formatRating(cohort.averageOverallRating)}</>
                )}
              </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            <RatingBar label="Качество" value={current?.qualityRating} color="success" />
            <RatingBar label="Скорость" value={current?.speedRating} color="warning" />
            <RatingBar label="Коммуникация" value={current?.communicationRating} color="info" />

            {current?.lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Обновлено {formatDate(current.lastUpdated)}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Mentor comment */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={CARD_SX}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FormatQuote color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Комментарий ментора
              </Typography>
            </Box>
            {current?.mentorName && (
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
                {current.mentorName}
              </Typography>
            )}
            <Typography
              variant="body1"
              color={current?.comment ? 'text.primary' : 'text.secondary'}
              sx={{ fontStyle: current?.comment ? 'normal' : 'italic', lineHeight: 1.7 }}
            >
              {current?.comment?.trim() || 'Ментор пока не оставил комментарий к оценке.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={CARD_SX}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Динамика рейтинга
            </Typography>
            {chartData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Недостаточно данных для графика
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 260, mt: 1 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e8ea" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, RATING_MAX]} tick={{ fontSize: 12 }} width={32} />
                    <RechartsTooltip
                      formatter={(value) => [formatRating(value), 'Рейтинг']}
                      labelFormatter={(label) => label}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#0052cc"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0052cc' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        </>
        )}

        {/* Task KPIs */}
        {(showFormalAssessment || showTaskRatings) && (
        <Grid size={{ xs: 12, lg: showFormalAssessment ? 5 : 7 }}>
          <Paper sx={CARD_SX}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <AssignmentTurnedIn color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Задачи
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <KpiTile label="Выполнено" value={tasks?.completed ?? 0} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <KpiTile
                  label="Вовремя"
                  value={tasks?.onTime ?? 0}
                  sub={
                    tasks?.onTimePercent != null
                      ? `${Number(tasks.onTimePercent).toFixed(0)}%`
                      : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <KpiTile
                  label="Среднее время"
                  value={
                    tasks?.averageTaskTimeHours != null
                      ? `${Number(tasks.averageTaskTimeHours).toFixed(1)} ч`
                      : '—'
                  }
                  sub="на задачу"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <KpiTile
                  label="Средняя оценка"
                  value={formatRating(tasks?.averageTaskRating)}
                  sub={
                    tasks?.ratedTasksCount != null
                      ? `${tasks.ratedTasksCount} оценённых`
                      : undefined
                  }
                />
              </Grid>
            </Grid>
            {tasks?.onTimePercent != null && tasks?.completed > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">
                    Выполнение в срок
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Number(tasks.onTimePercent).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Number(tasks.onTimePercent))}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
        )}

        {/* Recent rated tasks */}
        {(showFormalAssessment || showTaskRatings) && (
        <Grid size={{ xs: 12 }}>
          <Paper sx={CARD_SX}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Последние оценённые задачи
            </Typography>
            {recentRatedTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Пока нет оценённых задач
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={0}>
                {recentRatedTasks.map((task) => (
                  <Box
                    key={task.taskId}
                    sx={{
                      py: 2,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {task.title}
                      </Typography>
                      {task.feedback && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          {task.feedback}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(task.completedAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Chip
                      icon={<Star />}
                      label={task.rating != null ? `${task.rating} / ${RATING_MAX}` : '—'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default InternRating;
