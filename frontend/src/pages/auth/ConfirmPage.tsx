import { Anchor, Button, Stack, Text, TextInput } from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { useForm } from "@mantine/form";

import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { AuthShell } from "../../features/auth/components/AuthShell";

import { confirmUser } from "../../services/auth.service";

export function ConfirmPage() {
  const navigate = useNavigate();

  const search = useSearch({
    strict: false,
  });

  const email = typeof search.email === "string" ? search.email : "";

  const form = useForm({
    initialValues: {
      code: "",
    },

    validate: {
      code: (value) => (value.trim().length > 0 ? null : "Ingresa el código"),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!email) {
      notifications.show({
        title: "Correo no disponible",
        message: "Vuelve al registro e inténtalo nuevamente.",
        color: "red",
      });

      return;
    }

    try {
      const result = await confirmUser(email, values.code.trim());

      if (result.nextStep.signUpStep === "DONE") {
        notifications.show({
          title: "Cuenta verificada",
          message: "Ya puedes iniciar sesión.",
          color: "teal",
        });

        await navigate({
          to: "/auth/login",
        });
      }
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "Código inválido",
        message: "Verifica el código e inténtalo nuevamente.",
        color: "red",
      });
    }
  });

  return (
    <AuthShell
      title="Verifica tu correo"
      description={
        email
          ? `Ingresar el código enviado a ${email}`
          : "Ingresa el código de verificación."
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Código de verificación"
            placeholder="123456"
            required
            {...form.getInputProps("code")}
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            radius="md"
            variant="gradient"
            gradient={{
              from: "violet",
              to: "blue",
            }}
          >
            Verificar cuenta
          </Button>

          <Text size="sm" ta="center" c="dimmed">
            ¿Volver al inicio?{" "}
            <Anchor component={Link} to="/auth/login">
              Iniciar sesión
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthShell>
  );
}
