import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import GovConPage from "./GovConPage.jsx";

const mockSubmitLeadIntake = jest.fn();

jest.mock("../lib/supabaseClient.js", () => ({
  isSupabaseConfigured: true,
}));

jest.mock("../lib/secureIntake.js", () => ({
  isValidEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  submitLeadIntake: (...args) => mockSubmitLeadIntake(...args),
}));

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <GovConPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/Prime Company Name/i), {
    target: { value: "Prime Example LLC" },
  });
  fireEvent.change(screen.getByLabelText(/Corporate Email/i), {
    target: { value: "contracts@primeexample.com" },
  });
  fireEvent.change(screen.getByLabelText(/Solicitation Number/i), {
    target: { value: "SOL-2026-001" },
  });
  fireEvent.change(screen.getByLabelText(/Scoping Notes/i), {
    target: { value: "Need document lifecycle and coordination support." },
  });
};

describe("GovConPage", () => {
  beforeEach(() => {
    mockSubmitLeadIntake.mockReset();
  });

  it("renders the corporate identification table and capabilities matrix", () => {
    renderPage();

    expect(screen.getByRole("table", { name: /corporate identification/i })).toBeInTheDocument();
    expect(screen.getByText("Dani Declares LLC")).toBeInTheDocument();
    expect(screen.getByText("[Pending Verification or Assignment]")).toBeInTheDocument();
    expect(screen.getByText("Project coordination and vendor readiness support")).toBeInTheDocument();
  });

  it("clears the form and shows a confirmation reference after a successful submission", async () => {
    mockSubmitLeadIntake.mockResolvedValue({ id: "abc12345-6789" });
    renderPage();
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: /submit teaming inquiry/i }).closest("form"));

    await waitFor(() => {
      expect(screen.getByText(/Your teaming inquiry was received/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Confirmation Reference: GOVCON-ABC123456789/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prime Company Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Corporate Email/i)).toHaveValue("");
    expect(screen.getByLabelText(/Solicitation Number/i)).toHaveValue("");
    expect(screen.getByLabelText(/Scoping Notes/i)).toHaveValue("");
  });

  it("preserves form values and omits a confirmation reference when saving fails", async () => {
    mockSubmitLeadIntake.mockRejectedValue(new Error("save failed"));
    renderPage();
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: /submit teaming inquiry/i }).closest("form"));

    await waitFor(() => {
      expect(screen.getByText(/We couldn't save your teaming inquiry right now/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Confirmation Reference:/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Prime Company Name/i)).toHaveValue("Prime Example LLC");
    expect(screen.getByLabelText(/Corporate Email/i)).toHaveValue("contracts@primeexample.com");
    expect(screen.getByLabelText(/Solicitation Number/i)).toHaveValue("SOL-2026-001");
    expect(screen.getByLabelText(/Scoping Notes/i)).toHaveValue(
      "Need document lifecycle and coordination support."
    );
  });
});
