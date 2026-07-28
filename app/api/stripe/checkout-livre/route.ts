import { NextRequest, NextResponse } from 'next/server';
import { getStripe, LIVRE_VIERGE_CENTIMES } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Achat du livre vierge (édition papier 48 pages à remplir à la main), 90 €.
 * Volontairement SANS compte : c'est un objet qu'on achète comme un livre,
 * pas un abonnement. L'adresse de livraison est collectée par Stripe.
 */
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://new-livret-transmiexpert.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: LIVRE_VIERGE_CENTIMES,
            product_data: {
              name: 'Le livre vierge, Livret de Succession',
              description:
                'Édition papier de 48 pages, à remplir à la main. Expédié en Guadeloupe, en Martinique et dans l’Hexagone.',
            },
          },
          quantity: 1,
        },
      ],
      // La France couvre les départements d'outre-mer (codes postaux 97x).
      shipping_address_collection: { allowed_countries: ['FR'] },
      phone_number_collection: { enabled: true },
      metadata: { produit: 'livre_vierge' },
      locale: 'fr',
      success_url: `${origin}/livre/merci`,
      cancel_url: `${origin}/tarifs`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création session livre vierge :', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
