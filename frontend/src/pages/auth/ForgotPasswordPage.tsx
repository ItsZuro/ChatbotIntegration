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

import { useState } from "react";

import { AuthShell } from "../../features/auth/components/AuthShell";

import {
  confirmPasswordReset,
  requestPasswordReset,
} from "../../services/auth.service";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "confirm">("request");

  const [email, setEmail] = useState("");

  const requestForm = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Correo inválido",
    },
  });

  const confirmForm = useForm({
    initialValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      code: (value) => (value.trim().length > 0 ? null : "Ingresa el código"),

      password: (value) => {
        if (value.length < 8) {
          return "La contraseña debe " + "tener al menos " + "8 caracteres";
        }

        if (!/[A-Z]/.test(value)) {
          return "Debe incluir una " + "mayúscula";
        }

        if (!/[a-z]/.test(value)) {
          return "Debe incluir una " + "minúscula";
        }

        if (!/[0-9]/.test(value)) {
          return "Debe incluir un " + "número";
        }

        return null;
      },

      confirmPassword: (value, values) =>
        value === values.password ? null : "Las contraseñas " + "no coinciden",
    },
  });

  const handleRequest = requestForm.onSubmit(async (values) => {
    const normalizedEmail = values.email.trim().toLowerCase();

    try {
      const result = await requestPasswordReset(normalizedEmail);

      if (
        result.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE"
      ) {
        setEmail(normalizedEmail);

        setStep("confirm");

        notifications.show({
          title: "Revisa tu correo",
          message: "Te enviamos un código para restablecer tu contraseña.",
          color: "teal",
        });

        return;
      }

      notifications.show({
        title: "Solicitud procesada",
        message: "Continúa con las instrucciones enviadas.",
        color: "teal",
      });
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "No se pudo procesar la solicitud",
        message: "Verifica el correo e inténtalo nuevamente.",
        color: "red",
      });
    }
  });

  const handleConfirm = confirmForm.onSubmit(async (values) => {
    if (!email) {
      return;
    }

    try {
      await confirmPasswordReset(email, values.code.trim(), values.password);

      notifications.show({
        title: "Contraseña actualizada",
        message: "Ya puedes iniciar sesión con tu nueva contraseña.",
        color: "teal",
      });

      await navigate({
        to: "/auth/login",
      });
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "No se pudo cambiar la contraseña",
        message: "Verifica el código y los requisitos de la contraseña.",
        color: "red",
      });
    }
  });

  return (
    <AuthShell
      title={step === "request" ? "Recuperar contraseña" : "Nueva contraseña"}
      description={
        step === "request"
          ? "Ingresa tu correo y te enviaremos un código de recuperación."
          : `Ingresa el código enviado a ${email}.`
      }
    >
      {step === "request" ? (
        <form onSubmit={handleRequest}>
          <Stack gap="md">
            <TextInput
              label="Correo electrónico"
              placeholder="nombre@empresa.com"
              required
              {...requestForm.getInputProps("email")}
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
              Enviar código
            </Button>

            <Text size="sm" ta="center" c="dimmed">
              ¿Recordaste tu contraseña?{" "}
              <Anchor component={Link} to="/auth/login">
                Iniciar sesión
              </Anchor>
            </Text>
          </Stack>
        </form>
      ) : (
        <form onSubmit={handleConfirm}>
          <Stack gap="md">
            <TextInput
              label="Código de verificación"
              placeholder="123456"
              required
              {...confirmForm.getInputProps("code")}
            />

            <PasswordInput
              label="Nueva contraseña"
              required
              {...confirmForm.getInputProps("password")}
            />

            <PasswordInput
              label="Confirmar nueva contraseña"
              required
              {...confirmForm.getInputProps("confirmPassword")}
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
              Cambiar contraseña
            </Button>

            <Button
              variant="subtle"
              color="gray"
              onClick={() => setStep("request")}
            >
              Usar otro correo
            </Button>
          </Stack>
        </form>
      )}
    </AuthShell>
  );
}
