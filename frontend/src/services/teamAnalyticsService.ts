import api from './api';
import { TeamAnalyticsData } from '../types';

export async function fetchTeamAnalytics(): Promise<TeamAnalyticsData> {
  const { data } = await api.get('/tasks/team-analytics');
  return data;
}
