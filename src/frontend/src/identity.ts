import { AuthClient } from "@dfinity/auth-client";

let authClient: AuthClient;

export const getAuthClient = () => {
  if (!authClient) {
    throw new Error("Auth client not initialized");
  }

  return authClient;
};

export const initializeAuthClient = async () => {
  authClient = await AuthClient.create();

  await checkAuthentication();
};

export const checkAuthentication = async () => {
  const authButton = document.getElementById("authButton")!;
  const principalBadgeContainer = document.getElementById("principalBadgeContainer")!;
  const principalBadge = principalBadgeContainer.querySelector(".badge")!;

  if (await authClient.isAuthenticated()) {
    authButton.innerHTML = "Logout";
    principalBadge.innerHTML = `<code>${authClient.getIdentity().getPrincipal().toText()}</code>`;
    principalBadgeContainer.classList.replace("hidden", "flex");
  } else {
    authButton.innerHTML = "Login";
    principalBadge.innerHTML = "Login to view";
    principalBadgeContainer.classList.replace("flex", "hidden");
  }
}

export const login = async () => {
  // start the login process and wait for it to finish
  await new Promise<void>((resolve) => {
    authClient.login({
      identityProvider:
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app"
          : `http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
      onSuccess: resolve,
    });
  });

  await checkAuthentication();
};

export const logout = async () => {
  await authClient.logout();
  await checkAuthentication();
}
