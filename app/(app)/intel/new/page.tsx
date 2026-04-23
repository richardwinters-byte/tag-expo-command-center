import { redirect } from 'next/navigation';

export default function NewIntelRedirect() {
  redirect('/intel?log=1');
}
