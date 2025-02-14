"use client";

import { useState } from "react";
import { Address } from "@starknet-react/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import useScaffoldEthBalance from "~~/hooks/scaffold-stark/useScaffoldEthBalance";
import { useGlobalState } from "~~/services/store/store";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";
import { BalanceStyles } from "./BalanceStyles";

type BalanceProps = {
  address?: Address;
  className?: string;
  usdMode?: boolean;
};

/**
 * Display (ETH & USD) balance of an ETH address.
 */
export const Balance = ({ address, className = "", usdMode }: BalanceProps) => {
  const price = useGlobalState((state) => state.nativeCurrencyPrice);
  const strkPrice = useGlobalState((state) => state.strkCurrencyPrice);
  const { targetNetwork } = useTargetNetwork();
  const { formatted, isLoading, isError } = useScaffoldEthBalance({
    address,
  });
  const {
    formatted: strkFormatted,
    isLoading: strkIsLoading,
    isError: strkIsError,
    symbol: strkSymbol,
  } = useScaffoldStrkBalance({
    address,
  });
  const [displayUsdMode, setDisplayUsdMode] = useState(
    price > 0 ? Boolean(usdMode) : false,
  );

  const toggleBalanceMode = () => {
    if (price > 0 || strkPrice > 0) {
      setDisplayUsdMode((prevMode) => !prevMode);
    }
  };

  if (
    !address ||
    isLoading ||
    formatted === null ||
    strkIsLoading ||
    strkFormatted === null
  ) {
    return (
      <div className={BalanceStyles.divOne}>
        <div className= {BalanceStyles.divTwo}></div>
        <div className={BalanceStyles.divThree}>
          <div className={BalanceStyles.divFour}></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={BalanceStyles.divFive}
      >
        <div className="text-warning">Error</div>
      </div>
    );
  }

  // Calculate the total balance in USD
  const ethBalanceInUsd = parseFloat(formatted) * price;
  const strkBalanceInUsd = parseFloat(strkFormatted) * strkPrice;
  const totalBalanceInUsd = ethBalanceInUsd + strkBalanceInUsd;

  return (
    <>
      <button
        className={` ${BalanceStyles.button}  ${className}`}
        onClick={toggleBalanceMode}
      >
        <div className={BalanceStyles.divSix}>
          {displayUsdMode ? (
            <div className="flex">
              <span className={BalanceStyles.spanOne}>$</span>
              <span>
                {totalBalanceInUsd.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ) : (
            <>
              <div className={BalanceStyles.divSeven}>
                <div className="flex">
                  <span>{parseFloat(formatted).toFixed(4)}</span>
                  <span  className={BalanceStyles.span}>
                    {targetNetwork.nativeCurrency.symbol}
                  </span>
                </div>

                <div className="flex">
                  <span>{parseFloat(strkFormatted).toFixed(4)}</span>
                  <span className={BalanceStyles.span}>
                    {strkSymbol}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </button>
    </>
  );
};
