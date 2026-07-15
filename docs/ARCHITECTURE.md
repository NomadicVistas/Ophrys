# Prototype architecture

Ophrys should begin as a bounded, inspectable system. A transparent feedback loop is artistically stronger at prototype stage than a large model whose behaviour cannot be traced.

```text
┌──────────────────────────────────────────────────────┐
│                    PUBLIC SPACE                      │
│                                                      │
│  light / sound / movement       approach / refusal  │
└───────────────▲──────────────────────────┬───────────┘
                │                          │
        ┌───────┴────────┐         ┌───────▼────────┐
        │ SIGNAL ENGINE  │         │ OBSERVATION    │
        │ bounded states │         │ coarse events  │
        └───────▲────────┘         └───────┬────────┘
                │                          │
        ┌───────┴────────┐         ┌───────▼────────┐
        │ ADAPTIVE POLICY│◄────────│ EVENT BUFFER   │
        │ next condition │         │ short-lived    │
        └───────▲────────┘         └────────────────┘
                │
        ┌───────┴────────────────────────────────────┐
        │ COUNTER-FIELD                              │
        │ state log / uncertainty / reset / refusal │
        └────────────────────────────────────────────┘
```

## Design principles

- **Local first:** keep sensing, event handling and adaptation on-site where possible.
- **Low resolution:** collect the least precise input that can sustain the artistic question.
- **Bounded repertoire:** composition matters more than unlimited generation.
- **Visible uncertainty:** a successful prediction is not presented as knowledge of a person.
- **Failure as state:** missing input, latency and signal loss remain part of the work.
- **Repairable parts:** prefer replaceable components and documented interfaces.

## Inspectable ecosystem ledger

The runnable service projects artwork, runtime-field, simulated physical-output and counter-signal nodes as one closed bounded graph. Artwork relations record explicit composition or curatorial context. Public refusals instead coalesce into at most one UTC-hour counter-signal node containing accepted/applied/deferred totals, with a `counter-to` edge to the shared runtime field. The current bounded score also has one `simulated-as` edge to a deterministic light/sound evidence frame. Counter-signals use the aggregate-retention policy and never become publication or approval records; simulator evidence cannot claim hardware liveness.

## Transport-free physical bridge

`src/physical-bridge.mjs` is a pure adapter boundary. It accepts field-score schema version 1, verifies the bounded lure repertoire and numeric ranges, and emits capped light, sound and timing values plus a stable input digest. It imports no network, process, serial, GPIO or device transport. A rejected input becomes an explicit quiet fallback: light disabled, sound disabled and zero timing. Studio displays the derived frame and its limits, but the service neither sends device commands nor stores sensor streams.

## Possible first stack

The architecture is technology-neutral. A small implementation might use:

- a local single-board computer or laptop;
- microcontroller-controlled LEDs, directional speakers or a small kinetic element;
- coarse proximity, pressure, infrared-break or manually simulated events;
- a lightweight event bus;
- a transparent state machine or bounded learning policy;
- a local web interface for the counter-field and event log.

The final choice should follow the venue, available hardware and public-data boundary rather than novelty.
