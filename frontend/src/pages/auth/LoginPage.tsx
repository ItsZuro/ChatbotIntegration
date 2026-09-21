import {
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { useForm } from "@mantine/form";

import { Link, useNavigate } from "@tanstack/react-router";

import { AuthShell } from "../../features/auth/components/AuthShell";

import { loginUser } from "../../services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Correo inválido",

      password: (value) => (value.length > 0 ? null : "Ingresa tu contraseña"),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const result = await loginUser(
        values.email.trim().toLowerCase(),
        values.password,
      );

      if (result.nextStep.signInStep === "DONE") {
        notifications.show({
          title: "Bienvenido",
          message: "Sesión iniciada correctamente.",
          color: "teal",
        });

        await navigate({
          to: "/",
        });

        return;
      }

      if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
        await navigate({
          to: "/auth/confirm",
          search: {
            email: values.email.trim().toLowerCase(),
          },
        });

        return;
      }

      notifications.show({
        title: "Autenticación pendiente",
        message: "La cuenta requiere un paso adicional.",
        color: "yellow",
      });
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "No se pudo iniciar sesión",
        message: "Correo o contraseña incorrectos.",
        color: "red",
      });
    }
  });

  return (
    <AuthShell
      title="Iniciar sesión"
      description="Accede a tu espacio de trabajo."
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Correo electrónico"
            placeholder="nombre@empresa.com"
            required
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Contraseña"
            required
            {...form.getInputProps("password")}
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
            Iniciar sesión
          </Button>

          <Text size="sm" ta="center" c="dimmed">
            ¿No tienes una cuenta?{" "}
            <Anchor component={Link} to="/auth/register">
              Crear cuenta
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthShell>
  );
}
