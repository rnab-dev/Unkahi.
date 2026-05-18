// 6 Core Pillars mapping:
// 0: Hypervigilance
// 1: Boundary Collapse
// 2: Intrusive Guilt
// 3: Somatic Disconnect
// 4: Relational Isolation
// 5: Environment Control

export const STORY_PHASES = [
  {
    phase: "Phase 1: Waking Transitions",
    title: "Step 1: The First Breath",
    text: "The alarm rings. Before you open your eyes, what is your body's baseline physical reaction?",
    options: [
      { text: "My jaw is already clenched and I feel an immediate jolt.", weights: [1, 0, 0, 3, 0, 0] },
      { text: "I feel unusually heavy and numb, taking time to feel my limbs.", weights: [0, 0, 0, 4, 0, 0] },
      { text: "I open my eyes calmly, feeling rested.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "My mind instantly lists exactly what I need to control today.", weights: [2, 0, 0, 0, 0, 2] }
    ]
  },
  {
    phase: "Phase 1: Waking Transitions",
    title: "Step 2: The World Inside the Screen",
    text: "You check your notifications immediately. How does your nervous system react to seeing an unexpected notification symbol from an unknown email?",
    options: [
      { text: "Instant internal surge—I brace for a problem or bad news.", weights: [4, 0, 0, 0, 0, 0] },
      { text: "I immediately feel responsible, wondering what I missed.", weights: [0, 0, 3, 0, 0, 0] },
      { text: "I swipe it away unbothered.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "I feel an absolute need to open and categorize it immediately.", weights: [1, 0, 0, 0, 0, 3] }
    ]
  },
  {
    phase: "Phase 1: Waking Transitions",
    title: "Step 3: Commuting or Navigating a Shared Space",
    text: "You are entering a busy, crowded area. How do you instinctively choose your path or seat?",
    options: [
      { text: "I find a spot where my back is to the wall and I can see all exits.", weights: [2, 0, 0, 0, 0, 3] },
      { text: "I shrink back to take up as little physical space as possible.", weights: [0, 3, 0, 0, 1, 0] },
      { text: "I sit wherever is open, prioritizing my own comfort.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "I tune out entirely, dissociating until I arrive.", weights: [0, 0, 0, 4, 0, 0] }
    ]
  },
  {
    phase: "Phase 2: Midday Friction",
    title: "Step 4: Social Perimeter Breach",
    text: "An acquaintance comes over and stands just a little too close for comfort while talking. How do you handle it?",
    options: [
      { text: "I politely laugh and freeze to accommodate their space.", weights: [0, 4, 0, 1, 0, 0] },
      { text: "I mentally pull away completely, ignoring the physical sensation.", weights: [0, 1, 0, 3, 0, 0] },
      { text: "I casually take a firm step back to reclaim my space.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "I feel incredibly angry but suppress it to avoid conflict.", weights: [1, 3, 0, 0, 0, 0] }
    ]
  },
  {
    phase: "Phase 2: Midday Friction",
    title: "Step 5: The Work Task Request",
    text: "Someone asks you to take on an extra task, forcing you to ruin your evening layout. What happens next?",
    options: [
      { text: "I accept instantly out of fear of causing them disappointment.", weights: [0, 4, 1, 0, 0, 0] },
      { text: "I politely decline, protecting my scheduled evening.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "I take it on and restructure my entire night to fit it perfectly.", weights: [0, 1, 0, 0, 0, 3] },
      { text: "I agree, but feel immense guilt for wanting to say no.", weights: [0, 2, 3, 0, 0, 0] }
    ]
  },
  {
    phase: "Phase 2: Midday Friction",
    title: "Step 6: Processing a Mistake",
    text: "You just realized you made a minor, fixable mistake earlier today. How does your inner voice react?",
    options: [
      { text: "I repetitively blame myself, looping the mistake in my mind.", weights: [0, 0, 4, 0, 0, 0] },
      { text: "I panic and try to fix it silently before anyone notices.", weights: [3, 0, 1, 0, 0, 1] },
      { text: "I note it, apply a fix, and move on naturally.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "I detach from it entirely, feeling no connection to the error.", weights: [0, 0, 0, 3, 0, 0] }
    ]
  },
  {
    phase: "Phase 2: Midday Friction",
    title: "Step 7: The Emotional Drift",
    text: "The stress load around you becomes overwhelming during the afternoon. What happens internally?",
    options: [
      { text: "My mind blanks out and my body functions on autopilot.", weights: [0, 0, 0, 4, 0, 0] },
      { text: "I start hyper-managing small details to feel grounded.", weights: [0, 0, 0, 0, 0, 4] },
      { text: "I feel an urgent desire to hide from everyone.", weights: [0, 0, 0, 0, 4, 0] },
      { text: "I take a deep breath and take a ten-minute break.", weights: [0, 0, 0, 0, 0, 0] }
    ]
  },
  {
    phase: "Phase 3: Nightfall Retreat",
    title: "Step 8: Re-verifying Security",
    text: "You are closing up the house for the night. You already checked the lock 20 minutes ago. What do you do?",
    options: [
      { text: "I absolutely must check it again. The 'what if' is too strong.", weights: [2, 0, 0, 0, 0, 3] },
      { text: "I trust my memory and head to bed.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "I check it, and then check the stove and windows.", weights: [2, 0, 0, 0, 0, 4] },
      { text: "I ignore it, wishing I was completely alone in the woods.", weights: [0, 0, 0, 0, 2, 0] }
    ]
  },
  {
    phase: "Phase 3: Nightfall Retreat",
    title: "Step 9: Social Winding Down",
    text: "The day is finally over and you are alone in your private space. How does that silence feel?",
    options: [
      { text: "Relieving, solely because nobody can judge or expect anything from me.", weights: [0, 0, 0, 0, 4, 0] },
      { text: "Peaceful. I enjoy my own company.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "Uncomfortable. I need background noise to distract my thoughts.", weights: [2, 0, 2, 0, 0, 0] },
      { text: "I feel profound guilt for finally doing nothing.", weights: [0, 0, 4, 0, 0, 0] }
    ]
  },
  {
    phase: "Phase 3: Nightfall Retreat",
    title: "Step 10: Absolute Dark",
    text: "You close your eyes to sleep. How long does it take for your internal alarm to shut off?",
    options: [
      { text: "My heart races as my mind reviews every conversation.", weights: [3, 0, 2, 0, 0, 0] },
      { text: "I physically cannot un-tense my muscles for hours.", weights: [4, 0, 0, 1, 0, 0] },
      { text: "I drift off relatively quickly without distress.", weights: [0, 0, 0, 0, 0, 0] },
      { text: "I am numb and exhausted, collapsing into sleep immediately.", weights: [0, 0, 0, 3, 0, 0] }
    ]
  }
];

export const KIDS_LESSONS = [
  {
    title: "Lesson 1: The Forced Hug",
    text: "Aunty Bear wants a big hug, but Brave Bear feels squished. What should Brave Bear do?",
    options: [
      { text: "Offer a high-five instead! High-fives are super cool.", hint: "Great job! You are the boss of your own space!" },
      { text: "Hug anyway because he doesn't want her to be sad.", hint: "It's safe to say no! We never have to hug if we don't feel like it." }
    ]
  },
  {
    title: "Lesson 2: Tricky Tricks",
    text: "A friendly animal asks Brave Bear to try a new berry, but says 'Don't tell Mama Bear.' What should he do?",
    options: [
      { text: "Eat it secretly.", hint: "Uh oh! If someone tells us to hide a treat from Mama, it's a Trick!" },
      { text: "Run and ask Mama Bear first.", hint: "Amazing! We always ask our safe adults about new treats." }
    ]
  },
  {
    title: "Lesson 3: The Swimsuit Rule",
    text: "Brave Bear is learning about his body. Which parts are under the 'Swimsuit Rule'?",
    options: [
      { text: "The parts that his bathing suit covers.", hint: "Yes! Those are private zones. Only doctors or parents can check them to keep us healthy." },
      { text: "His paws and ears.", hint: "Those are okay for high-fives and listening, but the Swimsuit zones are totally private!" }
    ]
  },
  {
    title: "Lesson 4: Safe vs. Unsafe Secrets",
    text: "Brave Bear has a secret. How does he know if it's a Safe Secret or an Unsafe Secret?",
    options: [
      { text: "Safe secrets make you smile (like a surprise party). Unsafe secrets give you an uh-oh tummy feeling.", hint: "Spot on! We never keep Unsafe Secrets!" },
      { text: "All secrets are fun.", hint: "Actually, if an adult gives us a secret that feels heavy or scary, we must share it right away." }
    ]
  },
  {
    title: "Lesson 5: Playtime Stop",
    text: "Papa Bear is tickling Brave Bear. It's fun, but Brave Bear needs to catch his breath and says 'Stop!'",
    options: [
      { text: "Papa tickles for one more minute.", hint: "Remember, 'Stop' means stop right away, every single time!" },
      { text: "Papa safely stops right away.", hint: "That's respect! 'Stop' is a magic word that turns off playtime instantly." }
    ]
  },
  {
    title: "Lesson 6: Alone with Adults",
    text: "Brave Bear is at a party. An adult invites him to go see a cool toy in a back room alone.",
    options: [
      { text: "Go see the toy, wow!", hint: "Wait! We stay in the shiny open spaces." },
      { text: "Say 'Let me get my parents to come see!'", hint: "Perfect. We don't go into isolated rooms alone with other adults." }
    ]
  },
  {
    title: "Lesson 7: Uh-Oh Tummy Feelings",
    text: "Brave Bear's tummy starts doing flip-flops around a certain person, even if they are smiling.",
    options: [
      { text: "Listen to his tummy and tell a safe adult.", hint: "Yes! Our tummy flip-flops are our inner superhero alarm." },
      { text: "Ignore it, they are smiling.", hint: "Smiles can hide tricky things. Always listen to your bodily alarm!" }
    ]
  },
  {
    title: "Lesson 8: The Digital Request",
    text: "Someone on a tablet game offers Brave Bear golden coins if he sends a picture of himself.",
    options: [
      { text: "Say 'No way!' and show Mama Bear the screen.", hint: "Awesome! We never trade photos for digital stuff." },
      { text: "Send a tiny picture.", hint: "Nope! Pictures are private. Safe friends don't ask for trades like that." }
    ]
  },
  {
    title: "Lesson 9: Grooming Favorites",
    text: "An adult says, 'Brave Bear, you are my special favorite, let's keep our games a secret from the other cubs.'",
    options: [
      { text: "Feel special and keep the secret.", hint: "Oh no! Being 'the secret favorite' is an unsafe trick." },
      { text: "Tell Mama Bear about the 'favorite' secret.", hint: "You got it! Safe adults treat all cubs fairly out in the open." }
    ]
  },
  {
    title: "Lesson 10: Overcoming Fear",
    text: "Brave Bear knows about a broken rule, but he is scared he will get in trouble for telling.",
    options: [
      { text: "Be brave and tell the safe adult anyway.", hint: "Yes! You will NEVER be in trouble for speaking up about an unsafe rule." },
      { text: "Hide the broken rule.", hint: "It takes courage to speak up, but bringing it to the light keeps everyone safe." }
    ]
  }
];
