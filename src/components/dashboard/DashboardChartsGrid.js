import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ChartPanel from './ChartPanel';
import BoxPlotChart from './BoxPlotChart';
import {
  normalizeChartsPayload,
  normalizeTrendSeries,
  mapTasksByStatus,
  mapTasksByPriority,
  mapHiringDecisions,
  mapProgressBuckets,
  mapBarItems,
  mapProgramCompletionRates,
  mapMentorsWorkload,
  mapBoxplots,
  mergeTrendSeries,
  CHART_COLORS,
} from '../../utils/dashboardCharts';

const DONUT_COLORS = CHART_COLORS;

const renderDonut = (data, height = 220) => {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={78}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.key || entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const DashboardChartsGrid = ({ charts, loading = false }) => {
  const payload = useMemo(() => normalizeChartsPayload(charts), [charts]);

  const tasksTrend = useMemo(
    () =>
      mergeTrendSeries(
        payload.tasksCompletedTrend,
        payload.tasksCreatedTrend,
        'completed',
        'created'
      ),
    [payload]
  );

  const qualityTrend = useMemo(
    () =>
      mergeTrendSeries(
        payload.onTimeCompletionRateTrend,
        payload.averageTaskRatingTrend,
        'onTimePercent',
        'avgRating'
      ),
    [payload]
  );

  const assessmentsTrend = useMemo(
    () => normalizeTrendSeries(payload.assessmentsCountTrend),
    [payload]
  );

  const tasksByStatus = useMemo(() => mapTasksByStatus(payload.tasksByStatus), [payload]);
  const tasksByPriority = useMemo(() => mapTasksByPriority(payload.tasksByPriority), [payload]);
  const hiringDecisions = useMemo(
    () => mapHiringDecisions(payload.hiringDecisionsByType),
    [payload]
  );
  const internsByProgram = useMemo(
    () => mapBarItems(payload.internsByProgram),
    [payload]
  );
  const programCompletion = useMemo(
    () => mapProgramCompletionRates(payload.programCompletionRates),
    [payload]
  );
  const mentorsWorkload = useMemo(
    () => mapMentorsWorkload(payload.mentorsWorkload),
    [payload]
  );
  const progressBuckets = useMemo(
    () => mapProgressBuckets(payload.internProgressBuckets),
    [payload]
  );
  const boxplots = useMemo(() => mapBoxplots(payload.boxplots), [payload]);

  const groupByLabel =
    payload.groupBy === 'week'
      ? 'по неделям'
      : payload.groupBy === 'month'
        ? 'по месяцам'
        : 'по дням';

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <ChartPanel
          title="Динамика задач"
          subtitle={`Созданные и завершённые ${groupByLabel}`}
          loading={loading}
          height={280}
          emptyText={!tasksTrend.length ? 'Нет данных за период' : undefined}
        >
          {tasksTrend.length > 0 && (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={tasksTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="created" name="Создано" fill="#b2c5ff" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Завершено"
                  stroke="#36B37E"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <ChartPanel
          title="Качество и сроки"
          subtitle="Доля сдачи в срок и средняя оценка задач"
          loading={loading}
          height={260}
          emptyText={!qualityTrend.length ? 'Нет данных' : undefined}
        >
          {qualityTrend.length > 0 && (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="%" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 5]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="onTimePercent"
                  name="В срок, %"
                  stroke="#6554C0"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgRating"
                  name="Ср. оценка"
                  stroke="#FFAB00"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <ChartPanel
          title="Оценки менторов"
          subtitle="Количество assessments"
          loading={loading}
          height={260}
          emptyText={!assessmentsTrend.length ? 'Нет оценок' : undefined}
        >
          {assessmentsTrend.length > 0 && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={assessmentsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Оценок" fill="#006c47" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ChartPanel
          title="Задачи по статусу"
          loading={loading}
          height={240}
          emptyText="Нет задач"
        >
          {renderDonut(tasksByStatus)}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ChartPanel
          title="Задачи по приоритету"
          loading={loading}
          height={240}
          emptyText="Нет задач"
        >
          {renderDonut(tasksByPriority)}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 12, lg: 4 }}>
        <ChartPanel
          title="Решения по найму"
          loading={loading}
          height={240}
          emptyText="Нет решений за период"
        >
          {renderDonut(hiringDecisions)}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartPanel
          title="Стажёры по программам"
          loading={loading}
          height={280}
          emptyText="Нет данных"
        >
          {internsByProgram.length > 0 && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={internsByProgram} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" name="Стажёров" fill="#0052cc" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartPanel
          title="Выполнение программ"
          subtitle="% завершения"
          loading={loading}
          height={280}
          emptyText="Нет данных"
        >
          {programCompletion.length > 0 && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={programCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Выполнение']} />
                <Bar dataKey="value" name="Выполнение" fill="#36B37E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartPanel
          title="Нагрузка менторов"
          subtitle="Активные задачи"
          loading={loading}
          height={300}
          emptyText="Нет данных"
        >
          {mentorsWorkload.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mentorsWorkload} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="activeTasks" name="Задачи" fill="#FF8B00" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartPanel
          title="Нагрузка: стажёры и задачи"
          subtitle="Точка — один ментор"
          loading={loading}
          height={300}
          emptyText="Нет данных"
        >
          {mentorsWorkload.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis
                  type="number"
                  dataKey="activeInterns"
                  name="Стажёры"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="number"
                  dataKey="activeTasks"
                  name="Задачи"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                />
                <Scatter name="Менторы" data={mentorsWorkload} fill="#0052cc" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartPanel
          title="Распределение прогресса ИПР"
          subtitle="Гистограмма по корзинам"
          loading={loading}
          height={280}
          emptyText="Нет данных"
        >
          {progressBuckets.length > 0 && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={progressBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e2e4" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Стажёров" fill="#6554C0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ChartPanel
          title="Прогресс стажёров (box plot)"
          subtitle="Разброс по группам"
          loading={loading}
          height={300}
          emptyText="Нет данных для box plot"
        >
          {boxplots.length > 0 && <BoxPlotChart data={boxplots} height={280} />}
        </ChartPanel>
      </Grid>
    </Grid>
  );
};

export default DashboardChartsGrid;
