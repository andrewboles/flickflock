import { UserContext } from "../lib/context";
import { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import {
  Tabs,
  TextInput,
  PasswordInput,
  Progress,
  Text,
  Popover,
  Box,
  Button,
  Divider,
} from "@mantine/core";
import { At, Lock } from "tabler-icons-react";
import { CheckIcon, Cross1Icon } from "@modulz/radix-icons";
import {
  loginService,
  registerService,
  logoutService,
  checkUsernameInDb,
  updateUsername,
} from "../lib/authServices";
import { Link } from "next/link";

export default function SignInUp(props) {
  const [userContext, setUserContext] = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (userContext?.user?.username?.username) {
      router.push(`/`);
    }
  }, [userContext?.user?.username?.username, router]);

  return (
    <main>
      {userContext?.user ? (
        !userContext?.user?.username?.username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <LoginRegister router={router} />
      )}
    </main>
  );
}

function SignOutButton() {
  return (
    <button
      onClick={() => {
        logoutService();
      }}
    >
      Sign Out
    </button>
  );
}

function UsernameForm() {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useContext(UserContext);

  const onChange = (e) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFormValue(val);
      setIsValid(false);
      setIsValid(false);
    }
    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue, checkUsername]);

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const exists = await checkUsernameInDb(username);
        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const user = await updateUsername(formValue);
    setUserContext((oldValues) => {
      return { ...oldValues, user };
    });
  };

  return (
    !userContext?.user?.username && (
      <section>
        <h3>Set Your Username</h3>
        <form onSubmit={onSubmit}>
          <TextInput
            name="username"
            placeholder="username"
            value={formValue}
            onChange={onChange}
          ></TextInput>
          <UsernameMessage
            username={formValue}
            isValid={isValid}
            loading={loading}
          />
          <Button
            variant="light"
            type="submit"
            disabled={!isValid}
            color="grape"
            radius="md"
            size="md"
          >
            Choose
          </Button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p>{username} is available!</p>;
  } else if (username && !isValid) {
    return <p>That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

function LoginRegister({ router }) {
  const [formValue, setFormValue] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useContext(UserContext);
  const [errors, setErrors] = useState({});

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    let email, password;
    if(e.target[0].value === "dummy"){
     email = e.target[1].value;
     password = e.target[2].value;
    } else {

    email = formValue.email;
    password = formValue.password;
    }

    const fieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (Object.values(fieldErrors).some(Boolean)) {
      return setErrors({ ...fieldErrors });
    }

    function validateEmail(title) {
      if (
        typeof title !== "string" ||
        email.length < 6 ||
        !email.includes("@")
      ) {
        return "email should be at least 6 characters long";
      }
    }
    function validatePassword(title) {
      if (typeof title !== "string" || password.length < 6) {
        return "password should be at least 6 characters long";
      }
    }

    try {
      const user = await loginService({ email, password });
      if (user.error) {
        return setErrors({ email: `Invalid Credentials` });
      } else {
        return setUserContext((current) => {
          return { ...current, user };
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const google = async () => {
    router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`);
  };

  const facebook = async () => {
    router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/facebook`);
  };

  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    const email = formValue.email;
    const password = formValue.password;
    const passwordConfirm = formValue.passwordConfirm;
    const fieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
      passwordConfirm: passwordConfirm
        ? validateConfirmPassword(passwordConfirm, password)
        : null,
    };

    if (Object.values(fieldErrors).some(Boolean)) {
      return setErrors({ ...fieldErrors });
    }

    function validateEmail(title) {
      if (
        typeof title !== "string" ||
        email.length < 6 ||
        !email.includes("@")
      ) {
        return "email should be at least 6 characters long";
      }
    }
    function validatePassword(title) {
      if (typeof title !== "string" || password.length < 6) {
        return "password should be at least 6 characters long";
      }
    }
    function validateConfirmPassword(passwordConfirm, password) {
      if (password !== passwordConfirm) {
        return "passwords don't match";
      }
    }

    try {
      const user = await registerService({ email, password });
      if (user.error) {
        return setErrors({ email: `User with email ${email} already exists` });
      } else {
        return setUserContext((current) => {
          return { ...current, user };
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-card" style={{maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 'auto', marginRight: 'auto'}}>
      <Tabs color="grape" tabPadding="sm">
        <Tabs.Tab label="Login">
          <form onSubmit={onLoginSubmit}>
            <TextInput
              name="email"
              label="Your email"
              required
              placeholder="Your email"
              error={errors?.email}
              onChange={(e) => {
                setFormValue((current) => {
                  return { ...current, email: e.target.value };
                });
              }}
              value={formValue.email}
              icon={<At size={16} />}
            />
            <PasswordInput
              name="password"
              label="Your password"
              required
              placeholder="Your password"
              error={errors?.password}
              onChange={(e) => {
                setFormValue((current) => {
                  return { ...current, password: e.target.value };
                });
              }}
              value={formValue.password}
              icon={<Lock size={16} />}
            />
            <Button
              variant="light"
              type="submit"
              color="grape"
              radius="md"
              size="md"
            >
              Login
            </Button>
            <input type="hidden" name="loginType" value="login" />
          </form>
          <Divider my="sm" variant="dotted" />
          <Button
            variant="light"
            type="submit"
            color="red"
            radius="md"
            size="md"
            onClick={() => google()}
          >
            Login with Google
          </Button>
          <Button
            variant="light"
            type="submit"
            radius="md"
            size="md"
            onClick={() => facebook()}
          >
            Login with Facebook
          </Button>
          <Divider my="sm" variant="dotted" />
          <form onSubmit={onLoginSubmit}>
            <input type="hidden" name="loginType" value="dummy" />
            <input type="hidden" name="email" value="aa@aa.aa" />
            <input type="hidden" name="password" value="aaaaaa" />
            <Button
              variant="light"
              type="submit"
              color="yellow"
              radius="md"
              size="md"
            >
              Look around with dummy Account
            </Button>
          </form>
        </Tabs.Tab>
        <Tabs.Tab label="Register">
          <form onSubmit={onRegisterSubmit}>
            <TextInput
              name="email"
              label="Your email"
              required
              placeholder="Your email"
              error={errors?.email}
              onChange={(e) => {
                setFormValue((current) => {
                  return { ...current, email: e.target.value };
                });
              }}
              value={formValue.email}
              icon={<At size={16} />}
            />
            <PasswordStrength
              errors={errors}
              formValue={formValue}
              setFormValue={setFormValue}
            />
            <PasswordInput
              name="passwordConfirm"
              label="Confirm password"
              required
              placeholder="Your password"
              error={errors?.passwordConfirm}
              onChange={(e) => {
                setFormValue((current) => {
                  return { ...current, passwordConfirm: e.target.value };
                });
              }}
              value={formValue.passwordConfirm}
              icon={<Lock size={16} />}
            />
            <Button
              variant="light"
              type="submit"
              color="grape"
              radius="md"
              size="md"
            >
              Register
            </Button>
            <input type="hidden" name="loginType" value="register" />
          </form>
          <Divider my="sm" variant="dotted" />
          <Button
            variant="light"
            type="submit"
            color="red"
            radius="md"
            size="md"
            onClick={() => google()}
          >
            Sign up with Google
          </Button>
          <Button
            variant="light"
            type="submit"
            radius="md"
            size="md"
            onClick={() => facebook()}
          >
            Sign up with Facebook
          </Button>
          <form onSubmit={onLoginSubmit}>
            <input type="hidden" name="loginType" value="dummy" />
            <input type="hidden" name="email" value="aa@aa.aa" />
            <input type="hidden" name="password" value="aaaaaa" />
            <Button
              variant="light"
              type="submit"
              color="yellow"
              radius="md"
              size="md"
            >
              Look around with dummy Account
            </Button>
          </form>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
}

function PasswordRequirement({ meets, label }) {
  return (
    <Text
      color={meets ? "teal" : "red"}
      sx={{ display: "flex", alignItems: "center" }}
      mt={7}
      size="sm"
    >
      {meets ? <CheckIcon /> : <Cross1Icon />} <Box ml={10}>{label}</Box>
    </Text>
  );
}

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

function getStrength(password) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

export function PasswordStrength({ errors, formValue, setFormValue }) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [value, setValue] = useState("");
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(formValue.password)}
    />
  ));

  const strength = getStrength(formValue.password);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  return (
    <Popover
      opened={popoverOpened}
      position="bottom"
      placement="start"
      withArrow
      styles={{ popover: { width: "100%" } }}
      trapFocus={false}
      transition="pop-top-left"
      onFocusCapture={() => setPopoverOpened(true)}
      onBlurCapture={() => setPopoverOpened(false)}
      target={
        <PasswordInput
          required
          name="password"
          label="Your password"
          placeholder="Your password"
          description="Strong password should include letters in lower and uppercase, at least 1 number, at least 1 special symbol"
          error={errors?.password}
          onChange={(e) => {
            setFormValue((current) => {
              return { ...current, password: e.target.value };
            });
          }}
          value={formValue.password}
        />
      }
    >
      <Progress
        color={color}
        value={strength}
        size={5}
        style={{ marginBottom: 10 }}
      />
      <PasswordRequirement
        label="Includes at least 6 characters"
        meets={formValue.password.length > 5}
      />
      {checks}
    </Popover>
  );
}
