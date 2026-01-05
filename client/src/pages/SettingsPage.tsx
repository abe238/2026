import { motion } from 'framer-motion';
import { User, Bell, Moon, Globe, Info, ExternalLink } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Settings ⚙️
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Customize your experience
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
          Account
        </h2>
        <div className="bg-[var(--color-surface-primary)] rounded-xl overflow-hidden shadow-sm">
          <SettingsRow icon={User} label="Profile" sublabel="momentum@local" />
          <SettingsRow icon={Globe} label="Timezone" sublabel="America/Los_Angeles" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
          Preferences
        </h2>
        <div className="bg-[var(--color-surface-primary)] rounded-xl overflow-hidden shadow-sm">
          <SettingsRow icon={Bell} label="Notifications" sublabel="Coming soon" disabled />
          <SettingsRow icon={Moon} label="Dark Mode" sublabel="Coming soon" disabled />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
          About
        </h2>
        <div className="bg-[var(--color-surface-primary)] rounded-xl overflow-hidden shadow-sm">
          <SettingsRow icon={Info} label="Version" sublabel="1.0.0 MVP" />
          <a
            href="https://github.com/abe238/2026"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <SettingsRow
              icon={ExternalLink}
              label="GitHub"
              sublabel="View source code"
              showArrow
            />
          </a>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6"
      >
        <p className="text-sm text-[var(--color-text-tertiary)]">
          Built with 💚 for a more mindful 2026
        </p>
      </motion.div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  disabled,
  showArrow,
}: {
  icon: typeof User;
  label: string;
  sublabel: string;
  disabled?: boolean;
  showArrow?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Icon size={20} className="text-[var(--color-text-secondary)]" />
      <div className="flex-1">
        <p className="font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">{sublabel}</p>
      </div>
      {showArrow && (
        <span className="text-gray-400">→</span>
      )}
    </div>
  );
}
