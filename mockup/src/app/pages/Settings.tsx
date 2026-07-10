import { useState } from "react";
import { Link } from "react-router";

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    studyReminders: true,
    newMaterials: true,
    groupMessages: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/student" className="text-sm text-accent hover:underline mb-2 block">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold text-primary">Definições</h1>
        <p className="text-muted-foreground mt-1">Configura as tuas preferências</p>
      </div>

      {/* Notifications */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Notificações</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-primary">Email</div>
              <div className="text-sm text-muted-foreground">Receber notificações por email</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-primary">Push</div>
              <div className="text-sm text-muted-foreground">Notificações push na app</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) =>
                setNotifications({ ...notifications, push: e.target.checked })
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-primary">Lembretes de Estudo</div>
              <div className="text-sm text-muted-foreground">Alertas sobre rotinas e objetivos</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.studyReminders}
              onChange={(e) =>
                setNotifications({ ...notifications, studyReminders: e.target.checked })
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-primary">Novos Materiais</div>
              <div className="text-sm text-muted-foreground">Avisos de novos materiais nas turmas</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.newMaterials}
              onChange={(e) =>
                setNotifications({ ...notifications, newMaterials: e.target.checked })
              }
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-primary">Mensagens de Grupo</div>
              <div className="text-sm text-muted-foreground">Notificações de salas de grupo</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.groupMessages}
              onChange={(e) =>
                setNotifications({ ...notifications, groupMessages: e.target.checked })
              }
              className="w-4 h-4"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
          >
            Guardar Preferências
          </button>
        </form>
      </div>

      {/* Privacy */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Privacidade e Dados</h2>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 text-left border border-border rounded-md hover:bg-muted">
            Exportar os Meus Dados
          </button>
          <button className="w-full px-4 py-3 text-left border border-border rounded-md hover:bg-muted">
            Gerir Consentimentos para IA
          </button>
          <button className="w-full px-4 py-3 text-left border border-destructive text-destructive rounded-md hover:bg-destructive/5">
            Eliminar Conta
          </button>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Idioma e Região</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Idioma</label>
            <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
              <option>Português (Portugal)</option>
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Formato de Data
            </label>
            <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
              <option>dd/mm/aaaa</option>
              <option>mm/dd/yyyy</option>
              <option>yyyy-mm-dd</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
