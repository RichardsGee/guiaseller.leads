import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { RequireRole } from '../components/auth/RequireRole';
import { Shield, Users, Database, Wifi } from 'lucide-react';

export function SettingsPage() {
  const { user, hasRole } = useAuthStore();
  const isAdmin = hasRole('admin');

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminAPI.listUsers,
    enabled: isAdmin,
  });

  const users = usersData?.data?.users || [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* User Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-500" />
          Meu Perfil
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Nome</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Email</span>
            <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <span className="text-slate-500">Role</span>
            <p className="font-medium text-slate-900 dark:text-white capitalize">{user?.role}</p>
          </div>
          <div>
            <span className="text-slate-500">Permissões</span>
            <div className="flex gap-1 flex-wrap mt-1">
              {user?.permissions?.map((p: string) => (
                <span
                  key={p}
                  className="px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded text-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users */}
      <RequireRole roles={['admin']}>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Usuários Administrativos ({users.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">Nome</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-2.5 text-slate-500">{u.email}</td>
                    <td className="py-2.5 capitalize">{u.role}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          u.isActive ? 'text-green-600' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? 'bg-green-500' : 'bg-slate-400'
                          }`}
                        />
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </RequireRole>

      {/* System Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-green-500" />
          Status do Sistema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'API', status: 'Online', icon: Database },
            { label: 'Leads DB', status: 'Connected', icon: Database },
            { label: 'Firebase', status: 'Active', icon: Wifi },
          ].map((svc) => (
            <div
              key={svc.label}
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg"
            >
              <svc.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{svc.label}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{svc.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
