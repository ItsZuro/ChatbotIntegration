import {
  Bot,
  CalendarDays,
  Cloud,
  Database,
  FileText,
  TicketCheck,
  Users,
} from 'lucide-react';


export const metrics = [
  {
    title: 'Integraciones',
    value: '3',
    description: 'HubSpot, Jira y Calendar',
    icon: Cloud,
    color: 'violet',
  },
  {
    title: 'Automatización',
    value: 'Activa',
    description: 'OpenAI Function Calling',
    icon: Bot,
    color: 'blue',
  },
  {
    title: 'Documentos',
    value: 'S3',
    description: 'TXT, PDF y DOCX',
    icon: FileText,
    color: 'cyan',
  },
  {
    title: 'Auditoría',
    value: 'DynamoDB',
    description: 'Trazabilidad por request',
    icon: Database,
    color: 'teal',
  },
];


export const recentActivity = [
  {
    title: 'Contacto actualizado',
    description: 'Ana Torres · TechCorp',
    icon: Users,
    color: 'orange',
    time: 'HubSpot',
  },
  {
    title: 'Tarea UTP-4 creada',
    description:
      'Revisión e integración ERP del módulo de pagos',
    icon: TicketCheck,
    color: 'blue',
    time: 'Jira',
  },
  {
    title: 'Reunión técnica programada',
    description:
      '24 sep 2026 · 15:30 · 45 min',
    icon: CalendarDays,
    color: 'teal',
    time: 'Calendar',
  },
];