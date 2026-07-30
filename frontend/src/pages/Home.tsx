import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useUserStore } from "@/stores/useUserStore";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userId, setUserId, setUserName } = useUserStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [inputId, setInputId] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputName, setInputName] = useState("");

  useEffect(() => {
    if (userId) {
      navigate("/characters");
    }
  }, [userId, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // /api/v1/login
    //     {
    //   "email": "test@test.com",
    //   "password": "123456"
    // }
    const res = await fetch("/api/v1/login", {
      method: "POST",
      body: JSON.stringify({ email: inputId, password: inputPassword }),
      headers: { "Content-Type": "application/json" },
    });

    const user = await res.json();

    if (!res.ok) {
      alert("Login failed");
      return;
    }

    if (user) {
      setUserId(user.data.user.userId);
      setUserName(user.data.user.name);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/v1/register", {
      method: "POST",
      body: JSON.stringify({
        email: inputId,
        password: inputPassword,
        name: inputName,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result?.message || result?.error || "Register failed");
      return;
    }

    if (result?.data?.user) {
      setUserId(result.data.user.userId);
      setUserName(result.data.user.name);
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-phone">
      <form
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        className="w-full max-w-xs flex flex-col gap-4"
      >
        {mode === "register" && (
          <Input
            shape="square"
            placeholder="Name을 입력하세요"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="w-full"
          />
        )}
        <Input
          shape="square"
          placeholder="User Email을 입력하세요"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          className="w-full"
        />
        <Input
          type="password"
          shape="square"
          placeholder="User Password을 입력하세요"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          className="w-full"
        />
        <div className="flex w-full">
          <Button
            type="submit"
            width="full"
            size="l"
            variant="primary"
            className="mt-2"
          >
            {mode === "login" ? "Login" : "Register"}
          </Button>
        </div>
        <div className="flex w-full">
          <Button
            type="button"
            width="full"
            size="m"
            variant="tertiary"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "회원가입" : "로그인으로 돌아가기"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Home;
