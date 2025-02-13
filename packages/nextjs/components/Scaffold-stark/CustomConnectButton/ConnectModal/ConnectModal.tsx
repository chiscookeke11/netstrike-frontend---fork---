import { Connector, useConnect } from "@starknet-react/core";
import { useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { BurnerConnector, burnerAccounts } from "@scaffold-stark/stark-burner";
import { useTheme } from "next-themes";
import { LAST_CONNECTED_TIME_LOCALSTORAGE_KEY } from "~~/utils/Constants";
import { GenericModal } from "../GenericModal";
import { BlockieAvatar } from "../../BlockieAvatar";
import { Wallet } from "../Wallet";

const loader = ({ src }: { src: string }) => {
  return src;
};

export const ConnectModal = () => {
  const modalRef = useRef<HTMLInputElement>(null);
  const [isBurnerWallet, setIsBurnerWallet] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { connectors, connect, error, status, ...props } = useConnect();
  const [_, setLastConnector] = useLocalStorage<{ id: string; ix?: number }>(
    "lastUsedConnector",
    { id: "" },
    {
      initializeWithValue: false,
    },
  );
  const [, setLastConnectionTime] = useLocalStorage<number>(
    LAST_CONNECTED_TIME_LOCALSTORAGE_KEY,
    0,
  );

  const handleCloseModal = () => {
    if (modalRef.current) {
      modalRef.current.checked = false;
    }
  };

  function handleConnectWallet(
    e: React.MouseEvent<HTMLButtonElement>,
    connector: Connector,
  ): void {
    if (connector.id === "burner-wallet") {
      setIsBurnerWallet(true);
      return;
    }
    connect({ connector });
    setLastConnector({ id: connector.id });
    setLastConnectionTime(Date.now());
    handleCloseModal();
  }

  function handleConnectBurner(
    e: React.MouseEvent<HTMLButtonElement>,
    ix: number,
  ) {
    const connector = connectors.find((it) => it.id == "burner-wallet");
    if (connector && connector instanceof BurnerConnector) {
      connector.burnerAccount = burnerAccounts[ix];
      connect({ connector });
      setLastConnector({ id: connector.id, ix });
      setLastConnectionTime(Date.now());
      handleCloseModal();
    }
  }

  return (
    <div className="w-full " >
      <label
        htmlFor="connect-modal"
        className="block textShadowAnimation border-4 border-primary
    border-dashed [border-top-style:solid]
    [border-bottom-style:solid]
    text-5xl font-medium max-w-[504px] w-full py-4
    hover:bg-primary hover:text-[#000000]  cursor-pointer     "
      >
        <span>Connect</span>
      </label>
      

      <input
        ref={modalRef}
        type="checkbox"
        id="connect-modal"
        className="modal-toggle"
      />
      <GenericModal modalId="connect-modal">
        
          <div className="flex items-center justify-between border border-[#24dc8f] w-full py-1 px-4  ">
            <h3 className="text-xl font-bold text-[#24DC8F] m-0 mx-1 ">
              {isBurnerWallet ? "Choose account" : "Connect a Wallet"}
            </h3>
            <label
              onClick={() => setIsBurnerWallet(false)}
              htmlFor="connect-modal"
              className="btn btn-ghost text-[#24DC8F] btn-sm btn-circle cursor-pointer"
            >
              ✕
            </label>
          </div>
          <div className="flex flex-col flex-1 lg:grid">
            <div className="flex flex-col gap-3 w-full px-3 py-0 ">
              {!isBurnerWallet ? (
                connectors.map((connector, index) => (
                  <Wallet
                    key={connector.id || index}
                    connector={connector}
                    loader={loader}
                    handleConnectWallet={handleConnectWallet}
                  />
                ))
              ) : (
                <div className="flex flex-col pb-[20px] justify-end gap-3">
                  <div className="h-[300px] overflow-y-auto flex w-full flex-col gap-2">
                    {burnerAccounts.map((burnerAcc, ix) => (
                      <div
                        key={burnerAcc.publicKey}
                        className="w-full flex flex-col"
                      >
                        <button
                          className={`hover:bg-gradient-modal border rounded-md text-neutral py-[8px] pl-[10px] pr-16 flex items-center gap-4 ${
                            isDarkMode ? "border-[#385183]" : ""
                          }`}
                          onClick={(e) => handleConnectBurner(e, ix)}
                        >
                          <BlockieAvatar
                            address={burnerAcc.accountAddress}
                            size={35}
                          />
                          {`${burnerAcc.accountAddress.slice(
                            0,
                            6,
                          )}...${burnerAcc.accountAddress.slice(-4)}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
       
        <div className="bg-[#24DC8F] text-[#000000] max-h-[65px] p-0 text-lg text-center " >
          <p>Select a wallet and confirm</p>
        </div>
      </GenericModal>
    </div>
  );
};
