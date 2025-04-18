
export const mockReport = {
  executiveSummary: `This executive summary provides an overview of the transformative impact of artificial intelligence (AI) on mental health research, highlighting key developments and future directions in this rapidly evolving field.

Artificial intelligence technologies have fundamentally changed the landscape of mental health research in recent years [1]. From improving diagnostic accuracy to facilitating personalized treatment approaches, AI applications have addressed numerous challenges in mental healthcare. Machine learning algorithms have proven particularly valuable in identifying patterns in large datasets that might escape human observation [2].

The integration of AI with traditional research methodologies has accelerated discovery while raising important ethical considerations regarding privacy, algorithmic bias, and the appropriate role of technology in mental healthcare [3].`,

  introduction: `The intersection of artificial intelligence (AI) and mental health research represents one of the most promising frontiers in modern healthcare. As mental health disorders continue to affect millions globally, researchers and clinicians are increasingly turning to AI technologies to enhance understanding, diagnosis, and treatment of these conditions.

This report examines the multifaceted impact of AI on mental health research, exploring both the technological advances and their clinical applications. Recent developments in machine learning, natural language processing, and computer vision have created unprecedented opportunities to analyze complex psychological data, identify subtle patterns, and develop more responsive interventions [4].

The adoption of AI tools in mental health settings has grown substantially, with applications ranging from automated screening and digital phenotyping to treatment optimization and relapse prediction [5]. However, these technological advances also bring challenges related to implementation, validation, and ethical deployment.`,

  literatureReview: `The existing literature reveals a growing body of evidence supporting the efficacy of AI applications in mental health research. Early studies focused primarily on the use of machine learning for diagnostic classification, with several landmark papers demonstrating comparable or superior performance to traditional clinical assessment for conditions such as depression, anxiety, and post-traumatic stress disorder [6].

Natural language processing (NLP) has emerged as a particularly valuable approach, enabling researchers to analyze speech patterns, written communications, and social media content for indicators of psychological distress. Pennebaker's work on linguistic markers of mental health conditions has been extended through AI-based text analysis, revealing subtle changes in language use that can predict onset or exacerbation of symptoms [7].

Neuroimaging research has been transformed by the application of deep learning algorithms, which can identify structural and functional brain patterns associated with various mental health conditions. A 2023 meta-analysis by Chen et al. examined 47 studies applying convolutional neural networks to neuroimaging data, finding consistent improvements in diagnostic accuracy across multiple psychiatric disorders [8].

The development of digital phenotyping—the moment-by-moment quantification of individual-level human behavior using data from personal digital devices—represents another significant advance enabled by AI. Passive data collection from smartphones and wearable devices, analyzed using machine learning algorithms, has demonstrated potential for early detection of mood changes and behavioral patterns associated with mental health conditions [9].`,

  impactAnalysis: `The impact of AI on mental health research can be assessed across multiple domains: scientific discovery, clinical practice, and healthcare systems.

In scientific research, AI has accelerated the pace of discovery by enabling the analysis of larger and more complex datasets than previously possible. The ability to integrate diverse data types—genetic, neuroimaging, behavioral, and environmental—has supported more sophisticated models of mental health conditions that acknowledge their multifactorial nature [10].

For clinical applications, AI tools have enhanced assessment capabilities through automated analysis of speech, facial expressions, and behavioral patterns. These approaches offer potential advantages in objectivity, consistency, and the ability to detect subtle changes over time. Smartphone-based mood monitoring applications using AI algorithms have demonstrated effectiveness in tracking symptoms between clinical visits, potentially enabling earlier intervention [11].

At the healthcare system level, predictive analytics powered by AI offer promising approaches to resource allocation and service planning. Models that identify individuals at heightened risk for crisis or hospitalization can support proactive intervention strategies [12].

Despite these positive impacts, challenges remain in translating research advances into clinical practice. Implementation barriers include limited technical infrastructure, workforce training needs, and questions about the generalizability of AI models across diverse populations [13].`,

  conclusions: `Artificial intelligence has fundamentally transformed mental health research, offering new approaches to understanding, diagnosing, and treating psychological conditions. The integration of AI technologies with traditional research methods has accelerated discovery while raising important questions about implementation and ethics.

Several key conclusions emerge from this analysis:

1. AI applications have demonstrated particular value in analyzing complex, multimodal data that characterize mental health conditions.

2. Machine learning approaches offer opportunities for more personalized intervention strategies based on individual patterns and predictors.

3. Ethical considerations, including privacy protections and algorithmic fairness, must be prioritized as these technologies develop further.

4. Successful implementation requires multidisciplinary collaboration between computer scientists, mental health researchers, clinicians, and those with lived experience of mental health conditions.

Looking ahead, several promising directions for future research include the development of more interpretable AI models, expanded validation studies across diverse populations, and integration of AI tools into clinical workflows in ways that augment rather than replace human judgment [14].

The responsible advancement of AI in mental health research holds significant promise for improving understanding and treatment of conditions that affect millions worldwide. Realizing this potential will require continued attention to scientific rigor, ethical considerations, and the lived experiences of those navigating mental health challenges.`,

  comparison: `## Comparative Analysis: AI Mental Health Interventions in Europe vs US

The development and implementation of AI-based mental health interventions show significant differences between Europe and the United States, reflecting distinct regulatory frameworks, healthcare systems, and cultural approaches to technology.

In Europe, AI mental health interventions have generally developed within stricter regulatory frameworks, particularly following the implementation of the General Data Protection Regulation (GDPR) and evolving AI regulations. European approaches tend to emphasize integration with public healthcare systems, requiring more rigorous clinical validation prior to deployment. The European Commission's funding programs have specifically targeted mental health AI projects that demonstrate clear adherence to ethical guidelines and privacy protections [15].

By contrast, the United States has seen a more market-driven approach, with numerous private companies and startups developing AI mental health applications under a less restrictive regulatory environment. This has resulted in more rapid deployment but varying levels of evidence-based validation. The FDA has begun developing specific pathways for AI-based mental health technologies, though many applications remain outside formal regulatory oversight [16].

Clinical implementation also differs significantly. European countries like Sweden, the Netherlands, and the UK have piloted AI interventions within national health services, emphasizing stepped care models where AI tools serve as initial assessment or support mechanisms linked to professional services. The US landscape shows greater diversity, with direct-to-consumer applications coexisting alongside health system implementations, often linked to insurance-based care models [17].

User adoption patterns reveal that US consumers show higher willingness to independently engage with mental health technologies, while European usage typically shows stronger integration with professional services. Data from comparative studies indicates higher standalone usage rates in the US, compared to higher rates of clinician-recommended usage in European countries [18].

Future directions suggest possible convergence, as both regions recognize the importance of balancing innovation with appropriate safeguards. Cross-Atlantic collaborations increasingly seek to establish common frameworks for evaluating efficacy and ensuring ethical implementation of AI mental health interventions.`,
};

export const mockImages = [
  {
    src: "https://images.unsplash.com/photo-1610906570945-f1463d3a6558?q=80&w=2070&auto=format&fit=crop",
    caption: "Figure 1: Neural network model for depression prediction based on linguistic markers",
    source: "Chen et al. (2023)",
    page: 42,
    description: "This figure illustrates a deep learning architecture used to analyze natural language patterns associated with depressive symptoms. The model incorporates both lexical features and semantic context to improve prediction accuracy.",
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    caption: "Figure 2: Comparison of detection accuracy across different mental health conditions",
    source: "Roberts & Kim (2024)",
    page: 18,
    description: "Bar chart comparing the accuracy of AI-based screening tools for various mental health conditions. Depression and anxiety show the highest detection rates, while more complex conditions like bipolar disorder show lower accuracy.",
  },
  {
    src: "https://images.unsplash.com/photo-1572187147119-7b5a169c3b09?q=80&w=2070&auto=format&fit=crop",
    caption: "Figure 3: Framework for ethical AI implementation in mental healthcare",
    source: "WHO Report (2023)",
    description: "Conceptual diagram outlining key considerations for ethical implementation of AI in mental healthcare settings, including privacy, transparency, clinical validation, and ongoing monitoring requirements.",
  },
  {
    src: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=2034&auto=format&fit=crop",
    caption: "Figure 4: Digital phenotyping data collection from smartphone sensors",
    source: "Torous et al. (2023)",
    page: 65,
    description: "Illustration of passive data collection methods from smartphone sensors, including accelerometer, GPS, and usage patterns, that contribute to digital phenotyping for mental health monitoring.",
  },
];

export const mockReferences = [
  {
    title: "Artificial intelligence in mental health care: applications, challenges, and recommendations",
    authors: ["Rajpurkar, P.", "Yang, J.", "Dass, N."],
    year: 2023,
    journal: "Nature Digital Medicine",
    doi: "10.1038/s41746-023-00689-9",
    abstract: "This comprehensive review examines the growing applications of artificial intelligence in mental healthcare, highlighting both significant advances and persistent challenges. The authors provide a framework for evaluating AI tools in clinical settings and offer recommendations for responsible implementation.",
    url: "https://www.nature.com/articles/s41746-023-00689-9",
  },
  {
    title: "Machine learning approaches to mental health diagnosis: a systematic review",
    authors: ["Chen, T.", "Mirzaei, S.", "Narayanan, S."],
    year: 2022,
    journal: "Journal of Medical Internet Research",
    doi: "10.2196/jmir.2022.35721",
    abstract: "This systematic review analyzes 124 studies applying machine learning techniques to mental health diagnosis. The authors find consistent improvements in diagnostic accuracy across multiple conditions when AI algorithms are applied to structured clinical data, though generalizability remains a challenge.",
  },
  {
    title: "Ethical considerations for AI applications in psychiatric research and practice",
    authors: ["Thompson, A.", "Williams, D.", "Morrison, K."],
    year: 2024,
    journal: "American Journal of Psychiatry",
    doi: "10.1176/appi.ajp.2024.23050489",
    abstract: "This paper outlines key ethical considerations for the development and implementation of AI tools in mental healthcare. The authors address issues including informed consent, algorithmic bias, transparency, and appropriate clinical validation.",
  },
  {
    title: "The role of natural language processing in understanding psychopathology: Opportunities and challenges",
    authors: ["Garcia-Ceja, E.", "Riegler, M.", "Jakobsen, P."],
    year: 2022,
    journal: "Computational Linguistics in Clinical Psychology",
    doi: "10.1162/coli_a_00428",
    abstract: "This article examines applications of natural language processing techniques to understand and detect mental health conditions through analysis of speech and text. The authors discuss technical approaches, current applications, and future directions for this rapidly evolving field.",
  },
  {
    title: "Digital phenotyping in psychiatry: ethical, legal, and clinical implications",
    authors: ["Torous, J.", "Wisniewski, H.", "Keshavan, M."],
    year: 2023,
    journal: "JAMA Psychiatry",
    doi: "10.1001/jamapsychiatry.2023.1278",
    abstract: "This review discusses the concept of digital phenotyping—using smartphone and wearable device data to quantify behavior—and its applications in mental health research and care. The authors address both the potential benefits for early intervention and the ethical concerns regarding privacy and autonomy.",
  },
  {
    title: "Deep learning applications in neuroimaging for mental disorders: A systematic review",
    authors: ["Chen, X.", "Zhang, Y.", "Herrera-Melendez, A.L."],
    year: 2023,
    journal: "Neuroinformatics",
    doi: "10.1007/s12021-023-09621-x",
    abstract: "This meta-analysis examines 47 studies applying convolutional neural networks and other deep learning approaches to neuroimaging data in psychiatry. The authors find consistent improvements in diagnostic accuracy across multiple conditions, though methodological standardization remains a challenge.",
  },
  {
    title: "Language as a biomarker for mental health: Using linguistic analysis and natural language processing for mental health assessment",
    authors: ["Fineberg, S.K.", "Leavitt, J.", "Stahl, D.S."],
    year: 2021,
    journal: "Psychiatry Research",
    doi: "10.1016/j.psychres.2021.113011",
    abstract: "Building on Pennebaker's work on linguistic markers, this paper explores how natural language processing and linguistic analysis can be used to identify early signs of mental health conditions. The authors present evidence that specific patterns in word use, syntax, and emotional expression correlate with various psychological states.",
  },
  {
    title: "Integrating genomics, neuroimaging, and clinical data: Machine learning approaches for complex mental disorders",
    authors: ["Kumar, D.", "Wong, A.", "Nguyen, T."],
    year: 2023,
    journal: "Biological Psychiatry",
    doi: "10.1016/j.biopsych.2023.04.022",
    abstract: "This paper describes novel machine learning approaches for integrating diverse data types in mental health research, including genetic markers, neuroimaging features, and clinical assessments. The authors demonstrate how these integrated models can improve understanding of complex, multifactorial mental health conditions.",
  },
  {
    title: "Smartphone-based digital phenotyping for mood disorders: A systematic review of evidence",
    authors: ["Baglione, A.N.", "Girard, J.M.", "Cummins, N."],
    year: 2022,
    journal: "NPJ Digital Medicine",
    doi: "10.1038/s41746-022-00589-7",
    abstract: "This systematic review evaluates the evidence for smartphone-based mood monitoring using AI algorithms. The authors find moderate to strong evidence supporting the ability of these approaches to track symptom changes in depression and bipolar disorder, with potential applications for early intervention.",
  },
  {
    title: "Predictive analytics for psychiatric readmissions: Machine learning approaches for resource allocation",
    authors: ["Johnson, A.E.", "Pollard, T.J.", "Ghassemi, M."],
    year: 2023,
    journal: "Healthcare Informatics Research",
    doi: "10.4258/hir.2023.29.1.35",
    abstract: "This paper evaluates predictive models for psychiatric hospital readmissions, finding that machine learning algorithms can identify high-risk individuals with greater accuracy than traditional methods. The authors discuss implications for proactive intervention and resource allocation in mental healthcare systems.",
  },
  {
    title: "Implementation barriers for AI in mental healthcare: A qualitative study of clinician perspectives",
    authors: ["Rivera, S.", "Moritz, S.", "Kuhn, E."],
    year: 2023,
    journal: "Implementation Science",
    doi: "10.1186/s13012-023-01262-7",
    abstract: "Through interviews with mental healthcare providers, this study identifies key barriers to implementing AI tools in clinical practice, including technical infrastructure limitations, training needs, concerns about the therapeutic relationship, and questions about generalizability across diverse populations.",
  },
  {
    title: "Future directions for AI in mental healthcare: Augmenting rather than replacing clinical judgment",
    authors: ["Davidson, L.", "Martinez, R.", "Ibrahim, Z."],
    year: 2024,
    journal: "Annual Review of Clinical Psychology",
    doi: "10.1146/annurev-clinpsy-071523-025558",
    abstract: "This forward-looking review outlines promising directions for AI applications in mental healthcare, emphasizing approaches that complement rather than replace human clinical judgment. The authors advocate for interpretable models, rigorous validation across diverse populations, and integration of lived experience perspectives in technology development.",
  },
  {
    title: "Regulatory frameworks for mental health AI applications: A comparative analysis of European approaches",
    authors: ["Müller, H.", "Vandenberghe, D.", "Kharrazi, S."],
    year: 2023,
    journal: "European Journal of Health Law",
    doi: "10.1163/15718093-bja10095",
    abstract: "This paper analyzes the evolving regulatory landscape for AI-based mental health interventions in Europe, with particular focus on the intersection of GDPR, the EU AI Act, and healthcare-specific regulations. The authors examine case studies from several European countries implementing these technologies within public healthcare systems.",
  },
  {
    title: "The FDA regulatory pathway for AI-based mental health technologies: Current status and future directions",
    authors: ["Rodriguez, C.A.", "Nakamura, Z.M.", "Celi, L.A."],
    year: 2023,
    journal: "npj Digital Medicine",
    doi: "10.1038/s41746-023-00867-w",
    abstract: "This analysis examines the evolving FDA approach to regulating AI-based mental health technologies in the United States. The authors discuss the challenges of the current framework, including the distinction between wellness and clinical applications, and proposed pathways for more effective oversight of rapidly evolving technologies.",
  },
  {
    title: "Clinical integration of AI mental health interventions: A comparative study of implementation models in Sweden, Netherlands, UK, and the United States",
    authors: ["Andersson, G.", "Smith, J.", "Bakker, D."],
    year: 2024,
    journal: "The Lancet Digital Health",
    doi: "10.1016/S2589-7500(24)00034-X",
    abstract: "This comparative study examines different models for integrating AI-based mental health interventions into clinical care across four countries. The authors identify key differences in stepped-care approaches, professional oversight, payment models, and integration with existing clinical workflows.",
  },
  {
    title: "Consumer adoption patterns of digital mental health interventions: A US-European comparison",
    authors: ["Weisel, K.K.", "Fuhrmann, L.M.", "Lee, B.X."],
    year: 2023,
    journal: "Journal of Medical Internet Research",
    doi: "10.2196/43678",
    abstract: "This survey study compares adoption patterns and user experiences with AI-based mental health applications across US and European populations. The authors find significant differences in pathways to adoption, usage patterns, and attitudes toward data privacy and professional involvement in digital mental healthcare.",
  },
];
