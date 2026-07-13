import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import RequestServicePage from "./RequestServicePage";

jest.mock("../lib/supabaseClient.js", () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

const renderPage = (initialEntry = "/request-service") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <HelmetProvider>
        <RequestServicePage />
      </HelmetProvider>
    </MemoryRouter>
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

  it("prefills shop inquiries from routed state and query params", () => {
    renderPage({
      pathname: "/request-service",
      search: "?source=shop&package=Cheaper%20to%20Keep%20Dad%20Mug",
      state: {
        serviceNeeded: "Merchandise Printing",
        notes: "Inquiry regarding custom printing for: Cheaper to Keep Dad Mug",
      },
    });

    expect(screen.getByRole("textbox", { name: /service needed/i })).toHaveValue("Merchandise Printing");
    expect(screen.getByRole("textbox", { name: /request details/i })).toHaveValue(
      "Inquiry regarding custom printing for: Cheaper to Keep Dad Mug"
    );
  });

  it("submits with shop-prefilled inquiry context", () => {
    const { container } = renderPage({
      pathname: "/request-service",
      search: "?source=shop&package=Cheaper%20to%20Keep%20Dad%20Mug",
      state: {
        serviceNeeded: "Merchandise Printing",
        notes: "Inquiry regarding custom printing for: Cheaper to Keep Dad Mug",
      },
    });

    fireEvent.change(screen.getByRole("textbox", { name: /full name/i }), {
      target: { value: "Danielle" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "danielle@example.com" },
    });

    fireEvent.submit(container.querySelector("form"));

    expect(
      screen.getByText(/request submission is temporarily unavailable/i)
    ).toBeInTheDocument();
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
