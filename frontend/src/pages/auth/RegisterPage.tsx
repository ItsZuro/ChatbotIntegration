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

import { registerUser } from "../../services/auth.service";

export function RegisterPage() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Correo inválido",

      password: (value) => {
        if (value.length < 8) {
          return "La contraseña debe tener al menos 8 caracteres";
        }

        if (!/[A-Z]/.test(value)) {
          return "Debe incluir una mayúscula";
        }

        if (!/[a-z]/.test(value)) {
          return "Debe incluir una minúscula";
        }

        if (!/[0-9]/.test(value)) {
          return "Debe incluir un número";
        }

        return null;
      },

      confirmPassword: (value, values) =>
        value === values.password ? null : "Las contraseñas no coinciden",
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const result = await registerUser(
        values.email.trim().toLowerCase(),
        values.password,
      );

      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        notifications.show({
          title: "Revisa tu correo",
          message: "Te enviamos un código de verificación.",
          color: "teal",
        });

        await navigate({
          to: "/auth/confirm",
          search: {
            email: values.email.trim().toLowerCase(),
          },
        });

        return;
      }

      notifications.show({
        title: "Cuenta creada",
        message: "Tu cuenta fue creada correctamente.",
        color: "teal",
      });

      await navigate({
        to: "/auth/login",
      });
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "No se pudo crear la cuenta",
        message: "Revisa los datos e inténtalo nuevamente.",
        color: "red",
      });
    }
  });

  return (
    <AuthShell
      title="Crear cuenta"
      description="Regístrate para acceder a UTP Assistant."
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

          <PasswordInput
            label="Confirmar contraseña"
            required
            {...form.getInputProps("confirmPassword")}
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
            Crear cuenta
          </Button>

          <Text size="sm" ta="center" c="dimmed">
            ¿Ya tienes una cuenta?{" "}
            <Anchor component={Link} to="/auth/login">
              Iniciar sesión
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthShell>
  );
}
