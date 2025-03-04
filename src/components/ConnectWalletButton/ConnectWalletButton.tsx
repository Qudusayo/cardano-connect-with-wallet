import {
  ConnectWalletButtonProps,
  UnavailableWalletVisibility,
} from '../../global/types';
import {
  Dropdown,
  Menu,
  MenuItem,
  MenuItemIcon,
  Button,
  DesktopMenuItem,
} from './StyledButtonElements';
import { getWalletIcon, isWalletInstalled } from '../../utils';
import { useCardano } from '../../hooks';
import { capitalize, formatSupportedWallets } from '../../common';
import Color from 'color';
import {
  checkIsMobile,
  estimateAvailableWallets,
  WalletExtensionNotFoundError,
} from '../../utils/common';

const ConnectWalletButton = ({
  label,
  disabled,
  message,
  supportedWallets = [
    'Flint',
    'Nami',
    'Eternl',
    'Yoroi',
    'Typhon',
    'NuFi',
    'Lace',
  ],
  showUnavailableWallets = UnavailableWalletVisibility.SHOW_UNAVAILABLE_ON_MOBILE,
  alwaysVisibleWallets = [],
  primaryColor,
  borderRadius = 15,
  customCSS,
  customActions = [],
  hideActionMenu = false,
  afterComponent,
  beforeComponent,
  limitNetwork,
  onConnect,
  onDisconnect,
  onSignMessage,
  onStakeAddressClick,
  onConnectError,
}: ConnectWalletButtonProps) => {
  const {
    isEnabled,
    stakeAddress,
    signMessage,
    connect,
    disconnect,
    isConnected,
    installedExtensions,
    enabledWallet,
  } = useCardano({ limitNetwork: limitNetwork });

  const mobileWallets = ['flint'];
  const isMobile = checkIsMobile();
  const availableWallets = estimateAvailableWallets(
    supportedWallets,
    showUnavailableWallets,
    alwaysVisibleWallets,
    installedExtensions
  );

  const connectWallet = async (walletName: string) => {
    const onSuccess = () => {
      if (typeof onConnect === 'function') {
        onConnect(walletName);
      }
    };

    const onError = (error: Error) => {
      if (typeof onConnectError === 'function') {
        onConnectError(walletName, error);
      } else {
        if (error instanceof WalletExtensionNotFoundError) {
          const chromeStoreUrl = 'https://chrome.google.com/webstore/detail/';
          if (walletName.toLowerCase() === 'nami') {
            window.open(
              `${chromeStoreUrl}nami/lpfcbjknijpeeillifnkikgncikgfhdo`
            );
          } else if (walletName.toLowerCase() === 'flint') {
            window.open(
              `${chromeStoreUrl}flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj`
            );
          } else if (walletName.toLowerCase() === 'typhon') {
            window.open(
              `${chromeStoreUrl}typhon-wallet/kfdniefadaanbjodldohaedphafoffoh`
            );
          } else if (walletName.toLowerCase() === 'yoroi') {
            window.open(
              `${chromeStoreUrl}yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb`
            );
          } else if (walletName.toLowerCase() === 'eternl') {
            window.open(
              `${chromeStoreUrl}eternl/kmhcihpebfmpgmihbkipmjlmmioameka`
            );
          } else if (walletName.toLowerCase() === 'gerowallet') {
            window.open(
              `${chromeStoreUrl}gerowallet/bgpipimickeadkjlklgciifhnalhdjhe`
            );
          } else if (walletName.toLowerCase() === 'nufi') {
            window.open(
              `${chromeStoreUrl}nufi/gpnihlnnodeiiaakbikldcihojploeca`
            );
          } else if (walletName.toLowerCase() === 'lace') {
            window.open(
              `${chromeStoreUrl}lace/gafhhkghbfjjkeiendhlofajokpaflmk`
            );
          } else {
            alert(
              `Please make sure you are using a modern browser and the ${walletName} browser extension has been installed.`
            );
          }
        } else {
          alert(`Something went wrong. Please try again later.`);
        }
      }
    };

    connect(walletName, onSuccess, onError);
  };

  const connectMobileWallet = async (walletName: string) => {
    if (!isMobile) {
      connectWallet(walletName);
    }

    if (!mobileWallets.includes(walletName.toLowerCase())) {
      return;
    }

    if (walletName.toLowerCase() === 'flint') {
      if (isWalletInstalled('flint')) {
        connectWallet(walletName);
      } else {
        window.location.href = `https://flint-wallet.app.link/browse?dappUrl=${encodeURIComponent(
          window.location.href
        )}`;
      }
    }
  };

  const themeColorObject = primaryColor
    ? Color(primaryColor)
    : Color('#0538AF');
  const buttonTitle =
    stakeAddress && isConnected
      ? `${stakeAddress.slice(0, 12)}...`
      : label || 'Connect Wallet';

  const clickStakeAddress = () => {
    if (
      stakeAddress &&
      isConnected &&
      typeof onStakeAddressClick === 'function'
    ) {
      onStakeAddressClick(stakeAddress);
    }
  };

  const walletMenu = (
    <Menu id="connect-wallet-menu">
      {availableWallets ? (
        availableWallets.map((availableWallet) => {
          if (
            isMobile &&
            !mobileWallets.includes(availableWallet.toLowerCase())
          ) {
            return (
              <DesktopMenuItem
                borderRadius={borderRadius}
                key={availableWallet}
              >
                <MenuItemIcon src={getWalletIcon(availableWallet)} />
                {capitalize(availableWallet)}
                <span>Desktop Only</span>
              </DesktopMenuItem>
            );
          }

          return (
            <MenuItem
              borderRadius={borderRadius}
              primaryColor={themeColorObject.hex()}
              primaryColorLight={themeColorObject
                .mix(Color('white'), 0.9)
                .hex()}
              key={availableWallet}
              onClick={() => connectMobileWallet(availableWallet)}
            >
              <MenuItemIcon src={getWalletIcon(availableWallet)} />
              {capitalize(availableWallet)}
            </MenuItem>
          );
        })
      ) : (
        <span id="connect-wallet-hint">{`Please install a wallet browser extension (${formatSupportedWallets(
          supportedWallets
        )} are supported)`}</span>
      )}
    </Menu>
  );

  const actionMenu = hideActionMenu ? null : (
    <Menu id="connect-wallet-menu">
      {typeof message === 'string' && (
        <MenuItem
          borderRadius={borderRadius}
          primaryColor={themeColorObject.hex()}
          primaryColorLight={themeColorObject.mix(Color('white'), 0.9).hex()}
          onClick={() => signMessage(message, onSignMessage)}
        >
          Sign a message
        </MenuItem>
      )}
      {customActions.map((customAction, index) => (
        <MenuItem
          borderRadius={borderRadius}
          key={`custom-action-${index}`}
          primaryColor={themeColorObject.hex()}
          primaryColorLight={themeColorObject.mix(Color('white'), 0.9).hex()}
          onClick={customAction.onClick}
        >
          {customAction.label}
        </MenuItem>
      ))}
      <MenuItem
        borderRadius={borderRadius}
        primaryColor={themeColorObject.hex()}
        primaryColorLight={themeColorObject.mix(Color('white'), 0.9).hex()}
        onClick={() => {
          disconnect();
          if (typeof onDisconnect === 'function') {
            onDisconnect();
          }
        }}
      >
        Disconnect
      </MenuItem>
    </Menu>
  );

  if (typeof beforeComponent === 'undefined' && enabledWallet) {
    const walletIcon = getWalletIcon(enabledWallet);
    beforeComponent = (
      <img
        height={24}
        width={24}
        style={{ marginRight: '8px' }}
        src={walletIcon}
        alt={`${enabledWallet}-icon`}
      />
    );
  }

  return (
    <Dropdown
      id="connect-wallet-dropdown"
      customCSS={customCSS}
      primaryColor={themeColorObject.hex()}
    >
      <Button
        id="connect-wallet-button"
        onClick={clickStakeAddress}
        borderRadius={borderRadius}
        primaryColor={themeColorObject.hex()}
      >
        {beforeComponent}
        {buttonTitle}
        {afterComponent}
      </Button>
      {!disabled && (isEnabled && isConnected ? actionMenu : walletMenu)}
    </Dropdown>
  );
};

export default ConnectWalletButton;
