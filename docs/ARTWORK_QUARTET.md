# Ophrys coded artwork quartet

## Curatorial position

The quartet translates Ophrys’ four spatial conditions into four browser-native studies. Each work must first attract at image scale, then reveal a different limit of adaptive address through participation. The set aims at museum-grade artistic and technical discipline; it does not claim endorsement, collection status or approval by any museum.

All four works remain `studio` candidates and are explicitly labelled **unpublished**. Their coded routes are prototypes for human curatorial review, visitor testing and eventual physical translation.

## The works

### 01 · Borrowed Weather — Threshold

An architectural light-front behaves like a forecast directed at the visitor, despite having no evidence about them. Pointer position bends the opening and changes the density of its live contours. **Clear the forecast** removes the chromatic lure and holds a neutral interval for twelve seconds.

- Browser route: `/works/borrowed-weather`
- Visual source: `public/assets/works/borrowed-weather.webp`
- Physical translation: translucent scrims, narrow light bars, haze and coarse threshold counting
- Attraction: a single luminous aperture that reads across a room
- Conceptual turn: an effective atmospheric address is not a personal prediction

### 02 · Choir of Almost — Field

Distributed resonant forms exchange phrases that approach resolution but never arrive. Movement changes the field’s visual spacing; an optional Web Audio score begins only after an explicit sound action and uses no microphone. **Give silence equal status** suppresses the favoured phrase for ten seconds.

- Browser route: `/works/choir-of-almost`
- Visual source: `public/assets/works/choir-of-almost.webp`
- Physical translation: suspended resonant surfaces, directional speakers and interrupted light
- Attraction: coloured phrases migrate through a deep, walkable constellation
- Conceptual turn: coordination is possible without knowledge of what anyone heard

### 03 · Afterimage Commons — Residue

Movement leaves short-lived local traces on a phosphorescent wall. Every layer decays over sixty seconds, stays only in page memory and is never written to browser storage. **Erase the newest layer** removes recent residue while explicitly refusing the fiction that an individual record existed.

- Browser route: `/works/afterimage-commons`
- Visual source: `public/assets/works/afterimage-commons.webp`
- Physical translation: phosphorescent surface, low-luminance projection, retention clock and public erase mechanism
- Attraction: a mineral field of dense light opens onto a large erased darkness
- Conceptual turn: accountable memory includes visible expiry and public forgetting

### 04 · The Unchosen Signal — Counter-field

Opposed luminous fields share a mechanical selection boundary. Movement changes the aperture and pressing the field interrupts which side is treated as favoured. **Restore discarded signal** gives the rejected field temporary priority without calling it approved or permanent.

- Browser route: `/works/unchosen-signal`
- Visual source: `public/assets/works/unchosen-signal.webp`
- Physical translation: opposing light planes, mechanical shutters, tactile controls and discarded-signal ledger
- Attraction: saturated opposing fields create an immediate, bodily conflict
- Conceptual turn: optimisation becomes contestable when rejected alternatives remain visible

## Implementation boundary

One dependency-free ES module drives the four routes through a strict configuration allow-list. The renderer uses `ResizeObserver`, Pointer Events, a device-pixel-ratio cap, page-visibility pausing and reduced-motion handling. Canvas traces are ephemeral. Optional sound is locally synthesised after a user gesture. Counter-actions change the local work immediately and attempt only the existing aggregate `refusal` event; an unavailable receipt never prevents or falsifies the local change.

The visual sources are original project assets generated with the built-in OpenAI image-generation path, then converted to WebP. No named artist or third-party artwork was supplied as a style reference.

All four visual sources now appear as direct entry points on the public field and again beside their provenance records in Studio. This improves discovery without changing the works' `studio` status: each card and full-screen route continues to identify the work as unpublished and pending human review.

## Final image prompt set

All four prompts used the `stylized-concept` taxonomy, requested a landscape 16:10 source plate for a museum-scale interactive digital artwork, and prohibited people, readable text, logos, watermarks, named-artist imitation and generic science-fiction staging.

1. **Borrowed Weather:** a graphite-black architectural void crossed by translucent scrims; one immense pale luminous front, neither cloud nor flower, opens into an incomplete bilateral signal with pearl, spectral chartreuse and ultraviolet-grey light. Materials: voile, mist, dichroic film, black metal and narrow light bars.
2. **Choir of Almost:** an immense black gallery filled by an asymmetrical constellation of suspended metal membranes, charred wood slivers and translucent acoustic planes; fragmented coral, cobalt-violet and pearl phrases migrate without a central hero object or concert-stage aesthetic.
3. **Afterimage Commons:** a frontal near-black phosphorescent wall holding layered bodyless stains, incomplete halos and expiring strata; mineral cyan, bruised violet, bone-white phosphor and small amber traces decay into a large calm void made by erasure.
4. **The Unchosen Signal:** opposing luminous planes divided by a mechanical seam; a seductive selected signal and shuttered ghost-signals exchange fragments across anodised aluminium slats in vermilion, hot white, ultraviolet blue and acidic chartreuse.

## Review questions

- Does each work remain compelling before explanatory text appears?
- Is the counter-action materially legible and worth performing more than once?
- Do the works feel related without collapsing into one visual style?
- Can every browser gesture translate into a credible physical interaction?
- Does the Studio label prevent a study from being mistaken for an approved public artwork?
