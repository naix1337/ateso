import {useNavigation} from 'react-router';

/**
 * Basis für Page Transitions: dünner oranger Balken während Navigationen.
 * Für echte Übergänge später hier eine Overlay-Animation einhängen.
 */
export function RouteProgress() {
  const navigation = useNavigation();
  const active = navigation.state !== 'idle' && !navigation.formMethod;

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 z-[90] h-0.5 bg-orange transition-[width,opacity] duration-700 ease-out-expo ${
        active ? 'w-2/3 opacity-100' : 'w-full opacity-0'
      }`}
    />
  );
}
