import { api } from './api';

export interface StaffMember {
  id: string;
  name: string;
  title?: string;
  avatarUrl?: string;
}

export async function fetchStaff(businessId: string): Promise<StaffMember[]> {
  const { data } = await api.get(`/business/${businessId}/staff`);
  return data.staff || data.staffMembers || [];
}

export async function addStaff(
  businessId: string,
  payload: { name: string; title?: string; avatarUrl?: string }
): Promise<StaffMember> {
  const { data } = await api.post(`/business/${businessId}/staff`, payload);
  return data.staffMember || data;
}

export async function updateStaff(
  businessId: string,
  staffId: string,
  payload: Partial<StaffMember>
): Promise<StaffMember> {
  const { data } = await api.put(`/business/${businessId}/staff/${staffId}`, payload);
  return data.staffMember || data;
}

export async function deleteStaff(businessId: string, staffId: string): Promise<void> {
  await api.delete(`/business/${businessId}/staff/${staffId}`);
}
