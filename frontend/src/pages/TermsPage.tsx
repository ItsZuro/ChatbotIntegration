import { Divider, Stack, Text, Title } from "@mantine/core";

import { PublicPageShell } from "../features/public/components/PublicPageShell";

export function TermsPage() {
  return (
    <PublicPageShell>
      <Stack gap="xl">
        <Stack gap="sm">
          <Title order={1}>Condiciones del Servicio</Title>

          <Text c="dimmed">Última actualización: 22 de septiembre de 2026</Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            1. Descripción del servicio
          </Title>

          <Text c="dimmed" lh={1.7}>
            UTP Assistant es una aplicación académica y demostrativa que utiliza
            inteligencia artificial para procesar solicitudes y facilitar la
            interacción con servicios externos.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            2. Uso de la aplicación
          </Title>

          <Text c="dimmed" lh={1.7}>
            El usuario es responsable de la información que proporciona y de
            revisar las acciones propuestas antes de autorizarlas.
          </Text>

          <Text c="dimmed" lh={1.7}>
            No debe utilizarse la aplicación para realizar actividades ilegales,
            abusivas o que vulneren derechos de terceros.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            3. Integraciones externas
          </Title>

          <Text c="dimmed" lh={1.7}>
            Algunas funcionalidades dependen de servicios de terceros como
            Google Calendar, Jira y HubSpot. El acceso a estos servicios puede
            estar sujeto también a las condiciones establecidas por sus
            respectivos proveedores.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            4. Inteligencia artificial
          </Title>

          <Text c="dimmed" lh={1.7}>
            Las respuestas generadas mediante inteligencia artificial pueden
            contener errores o información incompleta. El usuario debe revisar
            la información antes de utilizarla para decisiones importantes.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            5. Disponibilidad
          </Title>

          <Text c="dimmed" lh={1.7}>
            Debido al carácter académico y demostrativo del proyecto, el
            servicio puede ser modificado, suspendido o limitado durante tareas
            de mantenimiento, desarrollo o evaluación.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            6. Contacto
          </Title>

          <Text c="dimmed" lh={1.7}>
            Para consultas relacionadas con UTP Assistant puede utilizarse el
            correo:
          </Text>

          <Text>darckproyect8@gmail.com</Text>
        </Stack>
      </Stack>
    </PublicPageShell>
  );
}
