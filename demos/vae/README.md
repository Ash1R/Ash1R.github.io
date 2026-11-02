# VAE Latent Space Explorer

A browser-based demo showing how a VAE encodes inputs as latent distributions, samples with reparameterization, and uses KL divergence to keep those distributions close to a normal prior.

## How to run

Open `index.html` in any modern browser.

## What to try

1. Press "Play path" to watch one latent-space path decode at five checkpoints.
2. Select an input example to draw $z$ from $q(z \mid x)$.
3. Press "Sample $z$ from $q(z \mid x)$" several times to see different latent samples from the same input.
4. Press "Draw sample cloud" to create many latent draws from the selected posterior.
5. Toggle "2D" and "3D" to compare a flat latent map with a 3D latent view.
6. Compare "With KL" and "No KL" using the same checkpoints.
7. Move your mouse around the 2D latent map to test your own z values.
8. Notice that the KL view keeps posterior samples near the prior, while the no-KL view can leave separated islands and gaps.

Keyboard shortcuts:

- Left/right arrows move between checkpoints.
- Space plays the guided path.
- K switches between model modes.

## Note

This is a simplified visualization, not a live trained neural network. The selected inputs are local images in `assets/`, and their 3D posterior means and standard deviations are hand-set to illustrate the VAE idea that the encoder predicts $q(z \mid x) = N(\mu, \operatorname{diag}(\sigma^2))$, samples $z = \mu + \sigma \odot \epsilon$, and trains the decoder with a reconstruction term plus KL regularization.
