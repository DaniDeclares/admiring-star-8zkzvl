import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import MerchPage from "./MerchPage.jsx";

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <MerchPage />
      </MemoryRouter>
    </HelmetProvider>
  );

describe("MerchPage", () => {
  afterEach(() => {
    document.title = "";
  });

  it("renders the merch hero and CTA links", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: /custom merch & print for every business, brand & event/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /request a print quote/i })
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: /request a print quote/i })[0]
    ).toHaveAttribute("href", "/request-service?division=ProductOps");
    expect(
      screen.getByRole("link", { name: /call \/ text \(470\) 485-7173/i })
    ).toHaveAttribute("href", "tel:+14704857173");

    await waitFor(() => {
      expect(document.title).toBe("Custom Merch & Print Services • Dani Declares");
    });
  });

  it("toggles the FAQ accordion", () => {
    renderPage();

    const rushOrderButton = screen.getByRole("button", {
      name: /do you do rush orders\?/i,
    });

    expect(rushOrderButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(rushOrderButton);

    expect(rushOrderButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/rush turnaround is available depending on current production schedule/i)
    ).toBeInTheDocument();
  });
});
