import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { UserProfile } from '../utils/offlineStorage';
import { 
  MessageSquare, 
  Send, 
  Hash, 
  Users, 
  ShieldAlert, 
  Radio, 
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

interface VolunteerChatProps {
  messages: ChatMessage[];
  user: UserProfile;
  isOnline: boolean;
  onSendMessage: (msg: ChatMessage) => void;
  language: 'es' | 'en';
}

export const VolunteerChat: React.FC<VolunteerChatProps> = ({
  messages,
  user,
  isOnline,
  onSendMessage,
  language
}) => {
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [inputText, setInputText] = useState('');

  const channels = [
    { id: 'general', name: 'general-campo', desc: 'Coordinación diaria de voluntarios y horarios' },
    { id: 'emergencias', name: 'alertas-inmediatas', desc: 'Canal prioritario de incidentes y seguridad' },
    { id: 'marina', name: 'costa-marina-ostional', desc: 'Operativos nocturnos y arribadas de tortugas' },
    { id: 'tsavo', name: 'sabana-tsavo-elefantes', desc: 'Telemetría y patrullas de paquidermos' },
    { id: 'biologos', name: 'consultas-cientificas', desc: 'Dudas botánicas y etológicas con biólogos' }
  ];

  const filteredMessages = messages.filter(m => m.channelId === activeChannel);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel,
      senderName: user.name,
      senderRole: user.role === 'biologist' ? 'Biólogo de Campo' : 'Voluntario/a en Terreno',
      avatarText: user.name.split(' ').map(n => n[0]).join(''),
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOfficialCoordinator: user.role === 'coordinator' || user.role === 'biologist'
    };

    onSendMessage(newMsg);
    setInputText('');
  };

  return (
    <div className="h-[600px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-4">
      {/* Channels Sidebar */}
      <div className="md:col-span-1 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'es' ? 'Canales de Campo' : 'Field Channels'}
            </span>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="En línea"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Modo local"></span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full text-left px-2.5 py-2 text-xs flex items-center gap-2 transition-colors ${
                  activeChannel === ch.id 
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 space-y-1">
          <div>Conectado como:</div>
          <div className="font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400">{user.volunteerBadgeId}</div>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="md:col-span-3 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
        {/* Top Channel Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {channels.find(c => c.id === activeChannel)?.name}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {channels.find(c => c.id === activeChannel)?.desc}
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              {language === 'es' ? 'No hay mensajes en este canal. Sé el primero en iniciar la conversación.' : 'No messages in this channel yet. Be the first to start.'}
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.isOfficialCoordinator 
                    ? 'bg-emerald-800 text-white' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {msg.avatarText}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {msg.senderName}
                    </span>
                    {msg.isOfficialCoordinator && (
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                        [Coordinación Oficial]
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/60 p-2.5 border border-slate-100 dark:border-slate-800">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'es' ? `Escribe un mensaje en #${channels.find(c => c.id === activeChannel)?.name}...` : `Type a message in #${channels.find(c => c.id === activeChannel)?.name}...`}
            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="p-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white transition-colors"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
