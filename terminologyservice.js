var tree = [
  {
    text: "Technik, Medizin, angewandte Wissenschaften",
    tags: ["6"],
    nodes: [
      {
        text: "Medizin und Gesundheit",
        tags: ["61"],
        nodes: [
          {
            text: "Humanphysiologie",
            tags: ["612"],
            nodes: [
              {
                text: "Einzelne Funktionen, Systeme, Organe",
                tags: ["612.1-.8"],
                nodes: [
                   {
                    text: "Blut und Kreislauf",
                    tags: ["612.1"],
                    nodes: [
                      {
                        text: "Blut",
                        tags: ["612.11"],
                        nodes: [
                          { 
                            text: "Leukozyten (Weiße Blutkörperchen)",
                            state: { selected: true },
                            tags: ["612.112"],
                            nodes: [
                              {
                                text: "Biophysik",
                                tags: ["612.1122"]
                              },
                              {
                                text: "Anzahl und Auszählung",
                                tags: ["612.1127"]
                              },
                            ]
                          }
                        ]
                      },
                    ]
                  },
                ], 
              },
            ],
          },
        ], 
      },
    ], 
  },
];
