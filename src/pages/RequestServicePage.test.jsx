import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import RequestServicePage from "./RequestServicePage";

jest.mock("../lib/supabaseClient.js", () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

const renderPage = () =>
  render(
    <HelmetProvider>
      <RequestServicePage />
    </HelmetProvider>
  );

describe("RequestServicePage", () => {
  it("enables submit when full name, email, and service needed are filled", () => {
    renderPage();

    const submitButton = screen.getByRole("button", { name: /submit request/i });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox", { name: /full name/i }), {
      target: { value: "Danielle" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "danielle@example.com" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /service needed/i }), {
      target: { value: "Courier support" },
    });

    expect(submitButton).toBeEnabled();
  });

  it("displays unavailable message when Supabase is not configured", () => {
    const { container } = renderPage();

    fireEvent.change(screen.getByRole("textbox", { name: /full name/i }), {
      target: { value: "Danielle" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "danielle@example.com" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /service needed/i }), {
      target: { value: "Courier support" },
    });

    fireEvent.submit(container.querySelector("form"));

    expect(
      screen.getByText(/request submission is temporarily unavailable/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/the request system is not fully connected yet/i)
    ).not.toBeInTheDocument();
  });
});
