import React, { useState } from 'react';
import { 
  Search, Mail, Bell, Check, AlertCircle, User, Star, ChevronRight, Settings, 
  X, ChevronDown, UploadCloud, Calendar as CalendarIcon, Clock, Copy, QrCode, 
  Play, Volume2, Image as ImageIcon, BarChart3, Menu, MoreVertical, Loader2, 
  Info, CheckCircle2, AlertTriangle, Eye, EyeOff, FileText, Download, Share2,
  Lock, ArrowRight, ArrowLeft, Home
} from 'lucide-react';

const customThemeCSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

:root {
  /* Aplicando cores do sistema de bubalinos */
  --color-primary: #ffcf78;
  --color-primary-hover: #f2b84d;
  --color-primary-light: #fca90f;
  --color-primary-dark: #ce7d0a;
  --color-background: #f8fcfa;
  --color-background-secondary: #f8fcfa;
  --color-background-dark: #404040;
  --color-text-primary: #43310b;
  --color-text-secondary: #404040;
  --color-text-tertiary: #838181;
  --color-text-light: #f8fcfa;
  --color-text-dark: #43310b;
  --color-border-primary: #b0b0b0;
  --color-border-focus: #ffcf78;
  --color-border-error: #e90000;
  --color-link-primary: #43310b;
  --color-link-hover: #ffcf78;
  --color-success: #9dffbe;
  --color-error: #e90000;
  --color-warning: #fca90f;
  --color-info: #b0b0b0;
  --table-row-even: #fff7ee;

  --background: var(--color-background);
  --foreground: var(--color-text-dark);
  --card: var(--color-background);
  --card-foreground: var(--color-text-dark);
  --popover: var(--color-background);
  --popover-foreground: var(--color-text-dark);
  --primary: var(--color-primary);
  --primary-foreground: var(--color-text-dark);
  --secondary: var(--color-background-secondary);
  --secondary-foreground: var(--color-text-dark);
  --muted: #e5e5e5;
  --muted-foreground: var(--color-text-tertiary);
  --accent: var(--color-primary-light);
  --accent-foreground: var(--color-text-dark);
  --destructive: var(--color-error);
  --destructive-foreground: var(--color-text-light);
  --border: var(--color-border-primary);
  --input: var(--color-border-primary);
  --ring: var(--color-border-focus);
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
`;

// ============================================================================
// COMPONENTES UNITÁRIOS PARA O CATÁLOGO
// ============================================================================

// --- UTILITÁRIO PARA IDENTIFICAÇÃO (DEV LABEL) ---
// Este componente serve apenas para mostrar o NOME EXATO do componente para você se achar no código
const DevLabel = ({ name, className = "mb-2 block" }) => (
  <div className={className}>
    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary-dark)] bg-[var(--primary)] bg-opacity-20 px-2 py-1 rounded border border-[var(--primary)] inline-block shadow-sm">
      {name}
    </span>
  </div>
);

// --- 1. AÇÕES E BOTÕES ---
const Button = ({ children, variant = 'primary', icon: Icon, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--color-primary-hover)] focus:ring-[var(--ring)]",
    secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--border)] border border-[var(--border)] focus:ring-[var(--ring)]",
    outline: "border-2 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:border-[var(--accent)] focus:ring-[var(--ring)]",
    danger: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-red-700 focus:ring-[var(--destructive)]",
    ghost: "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] focus:ring-[var(--ring)]"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const IconButton = ({ icon: Icon, variant = 'ghost', className = '', ...props }) => {
  const variants = {
    ghost: "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--color-primary-hover)]",
    outline: "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
  };
  return (
    <button className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 ${variants[variant]} ${className}`} {...props}>
      <Icon className="w-5 h-5" />
    </button>
  );
};

// --- 2. ENTRADAS DE TEXTO ---
const Input = ({ label, error, icon: Icon, type = "text", rightIcon: RightIcon, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
        )}
        <input
          type={type}
          className={`block w-full bg-[var(--background)] rounded-md sm:text-sm transition-colors text-[var(--foreground)]
            ${Icon ? 'pl-10' : 'pl-3'} ${RightIcon ? 'pr-10' : 'pr-3'} py-2 border 
            ${error ? 'border-[var(--destructive)] text-[var(--destructive)] placeholder-[var(--destructive)] focus:ring-[var(--destructive)] focus:border-[var(--destructive)]' : 'border-[var(--input)] focus:ring-[var(--ring)] focus:border-[var(--ring)]'}
            focus:outline-none focus:ring-1`}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <RightIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-[var(--destructive)]">{error}</p>}
    </div>
  );
};

const Textarea = ({ label, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>}
    <textarea 
      className="block w-full bg-[var(--background)] rounded-md sm:text-sm transition-colors text-[var(--foreground)] p-3 border border-[var(--input)] focus:ring-[var(--ring)] focus:border-[var(--ring)] focus:outline-none focus:ring-1"
      rows={4}
      {...props}
    />
  </div>
);

// --- 3. SELEÇÃO ---
const Select = ({ label, options = [], ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>}
    <div className="relative">
      <select className="block w-full bg-[var(--background)] rounded-md sm:text-sm transition-colors text-[var(--foreground)] pl-3 pr-10 py-2 border border-[var(--input)] focus:ring-[var(--ring)] focus:border-[var(--ring)] focus:outline-none focus:ring-1 appearance-none" {...props}>
        {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
    </div>
  </div>
);

const Checkbox = ({ label, defaultChecked = false }) => (
  <label className="flex items-center space-x-2 cursor-pointer w-max">
    <input type="checkbox" defaultChecked={defaultChecked} className="w-4 h-4 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--ring)] accent-[var(--primary-dark)]" />
    <span className="text-sm text-[var(--foreground)]">{label}</span>
  </label>
);

const RadioGroup = ({ name, options = [], defaultValue }) => (
  <div className="space-y-2">
    {options.map((opt, i) => (
      <label key={i} className="flex items-center space-x-2 cursor-pointer w-max">
        <input type="radio" name={name} value={opt} defaultChecked={opt === defaultValue} className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--ring)] accent-[var(--primary-dark)]" />
        <span className="text-sm text-[var(--foreground)]">{opt}</span>
      </label>
    ))}
  </div>
);

const Toggle = ({ defaultChecked = false }) => {
  const [enabled, setEnabled] = useState(defaultChecked);
  return (
    <button
      type="button"
      className={`${enabled ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2`}
      onClick={() => setEnabled(!enabled)}
    >
      <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--background)] shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
  );
};

const Slider = ({ label }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{label}</label>}
    <input type="range" className="w-full accent-[var(--primary-dark)]" />
  </div>
);

// --- 4. INDICADORES ---
const Badge = ({ children, variant = 'default' }) => {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variants = {
    default: "bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]",
    success: "bg-[var(--color-success)] text-[var(--color-text-dark)]",
    warning: "bg-[var(--color-warning)] text-[var(--color-text-dark)]",
    error: "bg-[var(--color-error)] text-[var(--color-text-light)]",
    info: "bg-[var(--color-info)] text-[var(--color-text-dark)]",
  };
  return <span className={`${baseStyle} ${variants[variant]}`}>{children}</span>;
};

const Chip = ({ children, onClose }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--accent-foreground)]">
    {children}
    {onClose && (
      <button onClick={onClose} className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[var(--primary-dark)] hover:text-[var(--background)] focus:outline-none">
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
);

const Avatar = ({ src, initials, size = 'md', className = '' }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full bg-[var(--muted)] text-[var(--foreground)] flex items-center justify-center overflow-hidden border-2 border-[var(--background)] shadow-sm ${className}`}>
      {src ? <img src={src} alt="Avatar" className="w-full h-full object-cover" /> : <span className="font-medium uppercase">{initials}</span>}
    </div>
  );
};

// --- 5. FEEDBACK E CARREGAMENTO ---
const Alert = ({ variant = 'info', title, description }) => {
  const variants = {
    info: { bg: "bg-[var(--color-info)] bg-opacity-20", border: "border-[var(--color-info)]", text: "text-[var(--foreground)]", icon: Info },
    success: { bg: "bg-[var(--color-success)] bg-opacity-30", border: "border-[var(--color-success)]", text: "text-[var(--foreground)]", icon: CheckCircle2 },
    warning: { bg: "bg-[var(--color-warning)] bg-opacity-20", border: "border-[var(--color-warning)]", text: "text-[var(--foreground)]", icon: AlertTriangle },
    error: { bg: "bg-[var(--color-error)] bg-opacity-10", border: "border-[var(--color-error)]", text: "text-[var(--color-error)]", icon: AlertCircle },
  };
  const { bg, border, text, icon: Icon } = variants[variant];
  return (
    <div className={`p-4 rounded-lg border flex gap-3 ${bg} ${border}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${text}`} />
      <div>
        <h3 className={`text-sm font-medium ${text}`}>{title}</h3>
        {description && <p className={`mt-1 text-sm ${text} opacity-90`}>{description}</p>}
      </div>
    </div>
  );
};

const ProgressBar = ({ progress = 50 }) => (
  <div className="w-full bg-[var(--muted)] rounded-full h-2.5 overflow-hidden">
    <div className="bg-[var(--primary-dark)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
  </div>
);

const Skeleton = ({ className = "h-4 w-full" }) => (
  <div className={`bg-[var(--muted)] animate-pulse rounded-md ${className}`}></div>
);

const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return <Loader2 className={`animate-spin text-[var(--primary-dark)] ${sizes[size]}`} />;
};

// --- 6. EXIBIÇÃO DE DADOS ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden ${className}`}>
    {children}
  </div>
);

const Divider = () => <hr className="border-t border-[var(--border)] w-full my-4" />;

const EmptyState = ({ icon: Icon, title, description, actionText }) => (
  <div className="text-center p-8 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center bg-[var(--background)]">
    <div className="bg-[var(--muted)] p-3 rounded-full mb-4">
      <Icon className="w-8 h-8 text-[var(--muted-foreground)]" />
    </div>
    <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">{title}</h3>
    <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-sm">{description}</p>
    {actionText && <Button variant="outline">{actionText}</Button>}
  </div>
);

// ============================================================================
// SEÇÃO DE ESTRUTURA DO CATÁLOGO
// ============================================================================

const ComponentSection = ({ title, description, children }) => (
  <div className="mb-12">
    <div className="mb-6 border-b border-[var(--border)] pb-4">
      <h2 className="text-2xl font-bold text-[var(--foreground)]">{title}</h2>
      {description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>}
    </div>
    <div className="bg-[var(--table-row-even)] rounded-xl border border-[var(--border)] p-6 sm:p-10">
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 md:p-12 font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{customThemeCSS}</style>
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-12 text-center md:text-left border-b border-[var(--border)] pb-8">
          <h1 className="text-4xl font-extrabold text-[var(--color-primary-dark)] tracking-tight mb-3">Catálogo Completo Bubalinos</h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mb-4">
            Uma coleção massiva de componentes de interface. Os itens abaixo representam todas as entradas 
            solicitadas, utilizando as cores, variáveis e tipografia do sistema visual.
          </p>
          <div className="bg-[var(--primary)] bg-opacity-10 border border-[var(--primary)] p-3 rounded-md inline-block">
             <span className="text-sm font-medium">💡 Dica: As etiquetas como <DevLabel name="Nome do Componente" className="inline-block mx-1" /> mostram o nome exato para você buscar no código.</span>
          </div>
        </header>

        <main>
          {/* ================================================================== */}
          <ComponentSection title="1. Botões e Ações (Buttons & Actions)">
            <div>
              <DevLabel name="Button" />
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-10 items-start">
              <div>
                <DevLabel name="IconButton" />
                <div className="flex items-center gap-2">
                  <IconButton icon={Settings} variant="ghost" />
                  <IconButton icon={Mail} variant="outline" />
                  <IconButton icon={Bell} variant="primary" />
                </div>
              </div>
              
              <div>
                <DevLabel name="Copy to Clipboard" />
                <div className="flex items-center gap-2">
                  <Button variant="outline" icon={Copy}>Copiar Link</Button>
                </div>
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="2. Entradas de Texto Básicas (Inputs)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div>
                <DevLabel name="Input Text" />
                <Input placeholder="Texto simples..." />
              </div>
              
              <div>
                <DevLabel name="Input Email" />
                <Input type="email" placeholder="usuario@exemplo.com" icon={Mail} />
              </div>
              
              <div>
                <DevLabel name="Input Password" />
                <Input type="password" placeholder="••••••••" rightIcon={EyeOff} />
              </div>
              
              <div>
                <DevLabel name="Input Number" />
                <Input type="number" placeholder="0.00" />
              </div>
              
              <div>
                <DevLabel name="Input Search" />
                <Input type="search" placeholder="Buscar no sistema..." icon={Search} />
              </div>
              
              <div>
                <DevLabel name="Textarea" />
                <Textarea placeholder="Digite uma mensagem longa aqui..." />
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="3. Entradas de Texto Avançadas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div>
                <div className="flex gap-2">
                  <DevLabel name="OTP Input" className="mb-2" />
                  <DevLabel name="Pin Input" className="mb-2" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input key={i} type="text" maxLength={1} className="w-10 h-12 text-center text-lg font-bold bg-[var(--background)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--ring)] focus:outline-none" defaultValue={i === 1 ? '7' : ''} />
                  ))}
                </div>
              </div>
              <div>
                <DevLabel name="Password Strength Meter" />
                <Input type="password" placeholder="Nova Senha" rightIcon={Eye} />
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--muted-foreground)]">Força da senha</span>
                    <span className="text-[var(--color-warning)] font-medium">Média</span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    <div className="w-1/3 bg-[var(--color-success)] rounded-full"></div>
                    <div className="w-1/3 bg-[var(--color-warning)] rounded-full"></div>
                    <div className="w-1/3 bg-[var(--muted)] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="4. Seleção e Controles (Selection & Toggles)">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              
              <div>
                <DevLabel name="Select" />
                <Select options={['Opção 1', 'Opção 2', 'Opção 3']} />
              </div>
              
              <div>
                <DevLabel name="MultiSelect" />
                <div className="p-2 border border-[var(--input)] rounded-md bg-[var(--background)] flex flex-wrap gap-2">
                  <Chip onClose={() => {}}>Filtro A</Chip>
                  <Chip onClose={() => {}}>Filtro B</Chip>
                  <input type="text" placeholder="Adicionar..." className="outline-none bg-transparent text-sm flex-1 min-w-[80px]" />
                </div>
              </div>

              <div>
                <DevLabel name="Checkbox" />
                <div className="flex flex-col gap-2 mt-2">
                  <Checkbox label="Aceito os termos" defaultChecked />
                  <Checkbox label="Receber emails" />
                </div>
              </div>

              <div>
                <DevLabel name="Radio Group" />
                <RadioGroup name="planos" options={['Plano Básico', 'Plano Pro', 'Plano Enterprise']} defaultValue="Plano Pro" />
              </div>

              <div>
                <DevLabel name="Switch / Toggle" />
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center justify-between w-48">
                    <span className="text-sm">Status Ativo</span>
                    <Toggle defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <DevLabel name="Slider" />
                <div className="mt-2">
                  <Slider />
                </div>
                
                <DevLabel name="Range Slider" className="mt-6 mb-2 block" />
                <div className="w-full mt-2">
                  <div className="relative h-2 bg-[var(--muted)] rounded-full">
                    <div className="absolute left-[20%] right-[40%] h-full bg-[var(--primary-dark)] rounded-full"></div>
                    <div className="absolute left-[20%] top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-white border-2 border-[var(--primary-dark)] rounded-full cursor-pointer shadow"></div>
                    <div className="absolute right-[40%] top-1/2 -translate-y-1/2 mr-[-8px] w-4 h-4 bg-white border-2 border-[var(--primary-dark)] rounded-full cursor-pointer shadow"></div>
                  </div>
                </div>
              </div>

              <div>
                <DevLabel name="Color Picker" />
                <div className="flex gap-2 items-center">
                  <input type="color" defaultValue="#ffcf78" className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <Input defaultValue="#ffcf78" className="font-mono w-32" />
                </div>
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="5. Datas e Arquivos (Dates & Files)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div>
                <DevLabel name="Date Picker" />
                <Input type="date" icon={CalendarIcon} />
              </div>
              
              <div>
                <DevLabel name="Time Picker" />
                <Input type="time" icon={Clock} />
              </div>
              
              <div>
                <DevLabel name="DateTime Picker" />
                <Input type="datetime-local" icon={CalendarIcon} />
              </div>
              
              <div>
                <DevLabel name="File Upload" />
                <input type="file" className="block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)] file:text-[var(--primary-foreground)] hover:file:bg-[var(--color-primary-hover)] cursor-pointer" />
              </div>
            </div>
            
            <div className="mt-8 w-full">
              <DevLabel name="Drag & Drop Upload" />
              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-10 flex flex-col items-center justify-center bg-[var(--background)] hover:bg-[var(--accent)] hover:bg-opacity-20 transition-colors cursor-pointer">
                <UploadCloud className="w-10 h-10 text-[var(--muted-foreground)] mb-3" />
                <p className="text-sm font-medium text-[var(--foreground)]">Clique ou arraste arquivos para cá</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">PNG, JPG ou PDF até 10MB</p>
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="6. Etiquetas e Status (Badges, Tags, Avatars)">
            <div className="flex flex-col gap-8">
              
              <div>
                <DevLabel name="Badge" />
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                </div>
              </div>

              <div>
                <div className="flex gap-2">
                  <DevLabel name="Tag" />
                  <DevLabel name="Chip" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Chip>Tag Simples</Chip>
                  <Chip onClose={() => {}}>Filtro Ativo</Chip>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-12">
                <div>
                  <DevLabel name="Avatar" />
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" initials="sm" />
                    <Avatar size="md" initials="md" />
                    <Avatar size="lg" src="https://i.pravatar.cc/150?img=32" />
                  </div>
                </div>
                
                <div>
                  <DevLabel name="Avatar Group" />
                  <div className="flex -space-x-3 mt-2">
                    <Avatar size="md" src="https://i.pravatar.cc/150?img=11" className="ring-2 ring-[var(--background)]" />
                    <Avatar size="md" src="https://i.pravatar.cc/150?img=12" className="ring-2 ring-[var(--background)]" />
                    <Avatar size="md" src="https://i.pravatar.cc/150?img=13" className="ring-2 ring-[var(--background)]" />
                    <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center text-xs font-bold ring-2 ring-[var(--background)] z-10">+5</div>
                  </div>
                </div>
              </div>

            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="7. Feedback, Loading e Alertas">
            
            <DevLabel name="Alert" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              <Alert variant="info" title="Informação" description="Seu perfil está 80% completo." />
              <Alert variant="success" title="Sucesso" description="Dados salvos com sucesso!" />
              <Alert variant="warning" title="Atenção" description="Sua assinatura vence em 3 dias." />
              <Alert variant="error" title="Erro" description="Falha ao conectar com o servidor." />
            </div>

            <div className="flex flex-wrap gap-12 items-start bg-[var(--background)] p-6 rounded-xl border border-[var(--border)] mb-8">
              <div className="flex-1 min-w-[200px]">
                <DevLabel name="Progress Bar" />
                <div className="flex justify-between text-sm mb-1 mt-2">
                  <span>Enviando arquivos...</span>
                  <span>75%</span>
                </div>
                <ProgressBar progress={75} />
              </div>
              
              <div>
                <div className="flex gap-2">
                  <DevLabel name="Circular Progress" />
                  <DevLabel name="Spinner" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border)]">
              <DevLabel name="Skeleton" />
              <div className="flex items-center gap-4 mt-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="8. Navegação (Navigation)">
            <div className="space-y-10">
              
              <div>
                <DevLabel name="Tabs" />
                <div className="border-b border-[var(--border)] flex space-x-6 mt-2">
                  <button className="pb-2 border-b-2 border-[var(--primary-dark)] text-[var(--primary-dark)] font-medium text-sm">Geral</button>
                  <button className="pb-2 border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium text-sm">Segurança</button>
                  <button className="pb-2 border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium text-sm">Cobrança</button>
                </div>
              </div>

              <div>
                <DevLabel name="Breadcrumb" />
                <div className="flex items-center space-x-2 text-sm text-[var(--muted-foreground)] mt-2">
                  <span className="hover:text-[var(--foreground)] cursor-pointer flex items-center gap-1"><Home className="w-4 h-4"/> Início</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="hover:text-[var(--foreground)] cursor-pointer">Configurações</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[var(--foreground)] font-medium">Perfil</span>
                </div>
              </div>

              <div>
                <DevLabel name="Pagination" />
                <div className="flex items-center space-x-1 mt-2">
                  <Button variant="outline" className="px-2 py-1"><ArrowLeft className="w-4 h-4" /></Button>
                  <Button variant="primary" className="px-3 py-1">1</Button>
                  <Button variant="ghost" className="px-3 py-1">2</Button>
                  <Button variant="ghost" className="px-3 py-1">3</Button>
                  <span className="px-2">...</span>
                  <Button variant="ghost" className="px-3 py-1">8</Button>
                  <Button variant="outline" className="px-2 py-1"><ArrowRight className="w-4 h-4" /></Button>
                </div>
              </div>

              <div>
                <DevLabel name="Stepper" />
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-[var(--primary-dark)]">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-sm z-10 border-2 border-[var(--primary-dark)]">1</div>
                    <span className="ml-2 font-medium text-sm">Carrinho</span>
                  </div>
                  <div className="flex-1 h-0.5 mx-4 bg-[var(--primary-dark)]"></div>
                  <div className="flex items-center text-[var(--primary-dark)]">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-dark)] text-white flex items-center justify-center font-bold text-sm z-10 border-2 border-[var(--primary-dark)]">2</div>
                    <span className="ml-2 font-medium text-sm text-[var(--foreground)]">Pagamento</span>
                  </div>
                  <div className="flex-1 h-0.5 mx-4 bg-[var(--border)]"></div>
                  <div className="flex items-center text-[var(--muted-foreground)]">
                    <div className="w-8 h-8 rounded-full bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center font-bold text-sm z-10">3</div>
                    <span className="ml-2 font-medium text-sm">Confirmação</span>
                  </div>
                </div>
              </div>

            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="9. Estrutura e Exibição de Dados (Data Display)">
            
            <div className="mb-10">
              <div className="flex gap-2">
                <DevLabel name="Accordion" />
                <DevLabel name="Collapse" />
              </div>
              <div className="border border-[var(--border)] rounded-lg bg-[var(--background)] overflow-hidden mt-2">
                <button className="w-full flex justify-between items-center p-4 hover:bg-[var(--accent)]/10 text-left">
                  <span className="font-medium text-[var(--foreground)]">Como funciona a integração?</span>
                  <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
                <div className="p-4 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)] bg-[var(--table-row-even)]">
                  Nosso sistema permite integração via API REST ou webhooks em tempo real...
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex gap-2">
                <DevLabel name="Table" />
                <DevLabel name="Data Grid" />
              </div>
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg mt-2">
                <table className="w-full text-left text-sm text-[var(--foreground)]">
                  <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                      <td className="px-4 py-3 font-medium">#001</td>
                      <td className="px-4 py-3">Maria Silva</td>
                      <td className="px-4 py-3"><Badge variant="success">Ativo</Badge></td>
                      <td className="px-4 py-3 text-right"><IconButton icon={MoreVertical} /></td>
                    </tr>
                    <tr className="bg-[var(--table-row-even)]">
                      <td className="px-4 py-3 font-medium">#002</td>
                      <td className="px-4 py-3">João Souza</td>
                      <td className="px-4 py-3"><Badge variant="warning">Pendente</Badge></td>
                      <td className="px-4 py-3 text-right"><IconButton icon={MoreVertical} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div>
                <div className="flex gap-2">
                  <DevLabel name="List" />
                  <DevLabel name="List Item" />
                </div>
                <ul className="bg-[var(--background)] rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] mt-2">
                  <li className="flex items-center gap-3 p-3 hover:bg-[var(--table-row-even)] cursor-pointer">
                    <FileText className="w-5 h-5 text-[var(--primary-dark)]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Relatório Anual.pdf</p>
                      <p className="text-xs text-[var(--muted-foreground)]">2.4 MB</p>
                    </div>
                    <IconButton icon={Download} />
                  </li>
                  <li className="flex items-center gap-3 p-3 hover:bg-[var(--table-row-even)] cursor-pointer">
                    <ImageIcon className="w-5 h-5 text-[var(--primary-dark)]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Foto_Fachada.jpg</p>
                      <p className="text-xs text-[var(--muted-foreground)]">1.1 MB</p>
                    </div>
                    <IconButton icon={Download} />
                  </li>
                </ul>
              </div>
              
              <div>
                <DevLabel name="Rating (Stars)" />
                <div className="flex items-center gap-1 text-[var(--primary-dark)] mt-2">
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 text-[var(--muted)]" />
                  <span className="ml-2 text-sm text-[var(--foreground)] font-medium">4.0 (120)</span>
                </div>

                <div className="mt-6 mb-4">
                  <DevLabel name="Divider" />
                  <Divider />
                </div>
                
                <DevLabel name="Empty State" />
                <div className="mt-2">
                  <EmptyState icon={Search} title="Nenhum resultado" description="Tente usar outros termos de busca." actionText="Limpar filtros" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <DevLabel name="Calendar" />
                <Card className="p-4 inline-block w-full mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <IconButton icon={ArrowLeft} />
                    <span className="font-bold">Outubro 2023</span>
                    <IconButton icon={ArrowRight} />
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-[var(--muted-foreground)]">
                    <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    <div className="p-2 text-[var(--muted-foreground)] opacity-50">29</div>
                    <div className="p-2 text-[var(--muted-foreground)] opacity-50">30</div>
                    <div className="p-2 hover:bg-[var(--accent)] rounded-full cursor-pointer">1</div>
                    <div className="p-2 hover:bg-[var(--accent)] rounded-full cursor-pointer">2</div>
                    <div className="p-2 bg-[var(--primary-dark)] text-white rounded-full font-bold cursor-pointer">3</div>
                    <div className="p-2 hover:bg-[var(--accent)] rounded-full cursor-pointer">4</div>
                    <div className="p-2 hover:bg-[var(--accent)] rounded-full cursor-pointer">5</div>
                  </div>
                </Card>
              </div>

              <div>
                <DevLabel name="Timeline" />
                <div className="space-y-4 relative border-l-2 border-[var(--muted)] ml-3 pl-4 mb-8 mt-2">
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-[var(--primary-dark)] border-2 border-white"></div>
                    <p className="text-sm font-bold">10:00 AM</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Reunião de Kickoff</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-[var(--muted)] border-2 border-white"></div>
                    <p className="text-sm font-bold text-[var(--muted-foreground)]">14:30 PM</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Revisão de Design</p>
                  </div>
                </div>

                <DevLabel name="Chart" />
                <div className="h-24 bg-[var(--background)] border border-[var(--border)] rounded-lg flex items-end justify-between p-4 gap-2 mt-2">
                  <div className="w-1/6 bg-[var(--accent)] rounded-t-sm h-[40%]"></div>
                  <div className="w-1/6 bg-[var(--primary-dark)] rounded-t-sm h-[80%] relative"></div>
                  <div className="w-1/6 bg-[var(--accent)] rounded-t-sm h-[60%]"></div>
                  <div className="w-1/6 bg-[var(--accent)] rounded-t-sm h-[30%]"></div>
                  <div className="w-1/6 bg-[var(--color-success)] rounded-t-sm h-[90%]"></div>
                </div>
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="10. Sobreposições (Overlays)">
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Exemplos visuais (mockups) de como esses componentes flutuantes se parecem.</p>
            
            <div className="flex flex-wrap gap-8 items-start">
              
              <div className="relative border border-dashed border-[var(--border)] p-8 pt-12 rounded-lg flex-1 min-w-[250px] flex justify-center items-center">
                <div className="absolute top-2 left-2"><DevLabel name="Tooltip" /></div>
                <div className="relative group cursor-pointer inline-block">
                  <Button variant="outline" icon={Info}>Passe o mouse</Button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[var(--foreground)] text-[var(--background)] text-xs rounded shadow-lg whitespace-nowrap opacity-100 transition-opacity">
                    Isso é um Tooltip!
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--foreground)]"></div>
                  </div>
                </div>
              </div>

              <div className="relative border border-[var(--border)] rounded-xl shadow-xl p-4 pt-10 bg-[var(--background)] flex-1 min-w-[250px]">
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                   <DevLabel name="Popover" />
                   <DevLabel name="Dropdown Menu" />
                   <DevLabel name="Context Menu" />
                   <DevLabel name="Command Palette" />
                </div>
                <ul className="text-sm mt-4">
                  <li className="px-3 py-2 hover:bg-[var(--accent)] rounded-md cursor-pointer flex items-center gap-2"><User className="w-4 h-4"/> Perfil</li>
                  <li className="px-3 py-2 hover:bg-[var(--accent)] rounded-md cursor-pointer flex items-center gap-2"><Settings className="w-4 h-4"/> Configurações</li>
                  <Divider />
                  <li className="px-3 py-2 hover:bg-red-50 text-red-600 rounded-md cursor-pointer flex items-center gap-2"><Lock className="w-4 h-4"/> Sair</li>
                </ul>
              </div>

              <div className="relative border border-[var(--border)] rounded-xl shadow-2xl p-6 pt-12 bg-[var(--background)] w-full max-w-sm mx-auto">
                <div className="absolute top-2 left-2 flex gap-1">
                   <DevLabel name="Modal" />
                   <DevLabel name="Alert Dialog" />
                </div>
                <div className="absolute right-4 top-4 cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><X className="w-5 h-5"/></div>
                <h3 className="text-lg font-bold mb-2 mt-2">Excluir conta?</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">Essa ação não pode ser desfeita. Todos os seus dados serão apagados permanentemente.</p>
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost">Cancelar</Button>
                  <Button variant="danger">Sim, Excluir</Button>
                </div>
              </div>

            </div>
            
            <div className="mt-8 flex gap-4">
              <div className="flex-1 border border-dashed border-[var(--border)] p-4 pt-10 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-sm flex justify-between items-center shadow-lg relative">
                 <div className="absolute top-2 left-2"><DevLabel name="Toast" /></div>
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                   <span>Arquivo enviado com sucesso!</span>
                 </div>
                 <X className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" />
              </div>
              
              <div className="flex-1 border-l-4 border-[var(--primary-dark)] shadow-xl bg-[var(--background)] p-4 pt-10 rounded-r-xl relative h-32 flex flex-col">
                 <div className="absolute top-2 left-2"><DevLabel name="Drawer" /></div>
                 <div className="flex justify-between items-center mb-4 mt-2">
                   <h3 className="font-bold">Filtros</h3>
                   <X className="w-4 h-4" />
                 </div>
                 <Skeleton className="h-2 w-full mb-2" />
                 <Skeleton className="h-2 w-2/3" />
              </div>
            </div>
          </ComponentSection>

          {/* ================================================================== */}
          <ComponentSection title="11. Mídia e Outros (Media & Misc)">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
              
              <div className="text-center flex flex-col items-center">
                <div className="self-start"><DevLabel name="QR Code" /></div>
                <div className="p-4 bg-white border border-[var(--border)] rounded-xl inline-block shadow-sm mt-2">
                  <QrCode className="w-24 h-24 text-[var(--foreground)]" />
                </div>
              </div>

              <div>
                <DevLabel name="Carousel" />
                <div className="relative rounded-xl overflow-hidden bg-[var(--muted)] h-40 group flex items-center justify-between px-2 mt-2">
                  <div className="absolute inset-0 flex justify-center items-center text-[var(--muted-foreground)]">
                    <ImageIcon className="w-12 h-12 opacity-50" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center z-10 cursor-pointer"><ArrowLeft className="w-4 h-4"/></div>
                  <div className="w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center z-10 cursor-pointer"><ArrowRight className="w-4 h-4"/></div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <div>
                  <DevLabel name="Video Player" />
                  <div className="relative rounded-xl overflow-hidden bg-[var(--background-dark)] h-32 flex flex-col justify-end group border border-[var(--border)] mt-2">
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--primary)] transition-colors text-white hover:text-black">
                         <Play className="w-5 h-5 ml-1" />
                       </div>
                     </div>
                     <div className="bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                       <div className="h-1 bg-white/30 rounded-full mb-2 cursor-pointer relative">
                         <div className="absolute top-0 left-0 h-full w-1/3 bg-[var(--primary)] rounded-full"></div>
                       </div>
                       <div className="flex justify-between items-center text-white text-xs">
                         <div className="flex items-center gap-2">
                           <Play className="w-3 h-3" />
                           <Volume2 className="w-3 h-3" />
                           <span>01:23 / 04:56</span>
                         </div>
                         <Settings className="w-3 h-3" />
                       </div>
                     </div>
                  </div>
                </div>
                
                <div>
                  <DevLabel name="Audio Player" />
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 flex items-center gap-4 mt-2">
                    <button className="text-[var(--primary-dark)] hover:text-[var(--primary)]"><Play className="w-5 h-5 fill-current"/></button>
                    <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full relative">
                       <div className="absolute left-0 top-0 h-full w-1/2 bg-[var(--primary-dark)] rounded-full"></div>
                       <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-[var(--primary-dark)] rounded-full shadow"></div>
                    </div>
                    <span className="text-xs font-mono">0:45</span>
                  </div>
                </div>
              </div>

            </div>
          </ComponentSection>

        </main>
      </div>
    </div>
  );
}