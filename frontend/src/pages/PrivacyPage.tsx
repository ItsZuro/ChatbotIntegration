import { Anchor, Divider, List, Stack, Text, Title } from "@mantine/core";

import { PublicPageShell } from "../features/public/components/PublicPageShell";

export function PrivacyPage() {
  return (
    <PublicPageShell>
      <Stack gap="xl">
        <Stack gap="sm">
          <Title order={1}>Política de Privacidad</Title>

          <Text c="dimmed">Última actualización: 22 de septiembre de 2026</Text>

          <Text c="dimmed" lh={1.7}>
            Esta Política de Privacidad describe cómo UTP Assistant utiliza y
            protege la información necesaria para proporcionar sus
            funcionalidades.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            1. Información procesada
          </Title>

          <Text c="dimmed" lh={1.7}>
            Dependiendo de las funciones que utilice el usuario, UTP Assistant
            puede procesar:
          </Text>

          <List spacing="xs" c="dimmed">
            <List.Item>
              Información de la cuenta, como dirección de correo electrónico.
            </List.Item>

            <List.Item>Mensajes enviados al asistente.</List.Item>

            <List.Item>
              Documentos proporcionados voluntariamente por el usuario.
            </List.Item>

            <List.Item>
              Audio proporcionado para funciones de transcripción.
            </List.Item>

            <List.Item>
              Registros técnicos necesarios para seguridad, auditoría y control
              de uso.
            </List.Item>
          </List>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            2. Datos de Google
          </Title>

          <Text c="dimmed" lh={1.7}>
            Si el usuario decide conectar Google Calendar, UTP Assistant utiliza
            Google OAuth para obtener autorización para interactuar con Google
            Calendar.
          </Text>

          <Text c="dimmed" lh={1.7}>
            La implementación actual utiliza esta autorización para crear
            eventos solicitados por el usuario. UTP Assistant no necesita que el
            usuario proporcione su contraseña de Google.
          </Text>

          <Text c="dimmed" lh={1.7}>
            Para mantener la conexión, puede almacenarse de forma protegida el
            token de autorización necesario para renovar el acceso concedido por
            el usuario.
          </Text>

          <Text c="dimmed" lh={1.7}>
            El usuario puede desconectar Google Calendar desde la sección de
            Integraciones de UTP Assistant.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            3. Finalidad del uso de los datos
          </Title>

          <List spacing="xs" c="dimmed">
            <List.Item>Autenticar a los usuarios.</List.Item>

            <List.Item>Procesar solicitudes enviadas al asistente.</List.Item>

            <List.Item>
              Proporcionar las funciones solicitadas por el usuario.
            </List.Item>

            <List.Item>
              Ejecutar acciones autorizadas sobre servicios conectados.
            </List.Item>

            <List.Item>
              Mantener seguridad, auditoría y límites de utilización.
            </List.Item>
          </List>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            4. Almacenamiento y seguridad
          </Title>

          <Text c="dimmed" lh={1.7}>
            La aplicación utiliza servicios cloud para almacenar información
            necesaria para su funcionamiento. Se aplican controles de acceso,
            autenticación y cifrado en los servicios que almacenan datos.
          </Text>

          <Text c="dimmed" lh={1.7}>
            Los documentos se almacenan de forma privada y las credenciales
            sensibles de servicios externos no se incluyen directamente en el
            código fuente.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            5. Servicios externos
          </Title>

          <Text c="dimmed" lh={1.7}>
            Algunas funcionalidades requieren proveedores externos, entre ellos
            servicios de Amazon Web Services, OpenAI, Google Calendar, Jira y
            HubSpot. Solo se utiliza la información necesaria para proporcionar
            las funcionalidades solicitadas.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            6. Control del usuario
          </Title>

          <Text c="dimmed" lh={1.7}>
            La conexión con servicios externos es opcional. En el caso de Google
            Calendar, el usuario puede revocar la integración desde UTP
            Assistant o desde la configuración de seguridad de su cuenta de
            Google.
          </Text>
        </Stack>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h3">
            7. Contacto
          </Title>

          <Text c="dimmed">
            Para consultas relacionadas con privacidad o con el funcionamiento
            de la aplicación:
          </Text>

          <Anchor href="mailto:darckproyect8@gmail.com">
            darckproyect8@gmail.com
          </Anchor>
        </Stack>
      </Stack>
    </PublicPageShell>
  );
}
