import { restRpc } from './supabase.js'

export function onboardClientProject(accessToken, input) {
  return restRpc('onboard_client_project', accessToken, {
    p_name: input.name,
    p_short_name: input.shortName || '',
    p_industry: input.industry || '',
    p_location: input.location || '',
    p_employee_count: Number(input.employeeCount || 0),
    p_contact: {
      name: input.contactName || '',
      email: input.contactEmail || '',
      rolle: input.contactRole || '',
    },
    p_account_manager_key: input.accountManagerKey || 'mr',
    p_project_name: input.projectName || 'Ursachenanalyse',
    p_start_date: input.startDate || null,
    p_result_date: input.resultDate || null,
  })
}
