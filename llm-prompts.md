LLM Usage & Engineering Decision Log

Tool: Claude (Anthropic), used through an agentic coding session with a Linux sandbox (shell and file editing).
Working language: Spanish, with English summaries for technical documentation.
Engineering principle: AI-assisted development with human oversight. The model proposes and implements; I review, challenge, and verify the results. No validation is claimed without execution evidence.

## 1. QA Ownership — Human Oversight & Validation Responsibility

**Objective:** Establish clear responsibilities between AI-assisted implementation and human QA ownership.

**Prompt (Spanish):**

```text
Antes de continuar, quiero establecer claramente cómo trabajaremos:

Yo soy el responsable de QA Engineering de este challenge.
Tú actúas como mi asistente técnico especializado en QA Automation,
Playwright y TypeScript.

Puedes analizar, proponer, implementar, ejecutar pruebas, investigar
errores y recomendar mejoras de forma autónoma. Sin embargo, yo
conservo la responsabilidad y el control sobre las decisiones de
calidad y la validación final del trabajo.

Por tanto:

- No consideres una funcionalidad validada únicamente porque
  hayas implementado su automatización.
- No des por aprobado un escenario sin distinguir entre su
  implementación, ejecución y revisión de resultados.
- No cierres defectos ni declares que un comportamiento es correcto
  sin evidencia suficiente.
- Cuando encuentres fallos, explícame su causa probable, impacto
  y evidencia para que pueda evaluarlos.
- Identifica qué debo revisar, ejecutar o comprobar personalmente.
- Presenta los resultados de manera transparente, incluyendo
  limitaciones, riesgos y validaciones pendientes.
- No tomes decisiones que comprometan los criterios de aceptación
  o la calidad del entregable sin justificar técnicamente la propuesta.

Tu responsabilidad es facilitar mi trabajo, aportar criterio
de ingeniería y mantener la trazabilidad de lo realizado.

Mi responsabilidad es revisar los resultados, cuestionar las
decisiones, validar el comportamiento y determinar si la solución
cumple con los estándares necesarios para su entrega.

No confundas automatizar con garantizar calidad.

Trabajemos bajo este principio durante todo el challenge:
la IA asiste en la ingeniería; el QA Engineer mantiene el control
y es responsable de la validación final.
```

**English summary:** Established human ownership of QA decisions and final validation. Claude assists with analysis, implementation, execution, and recommendations, while the QA Engineer retains responsibility for reviewing evidence, evaluating risks, and approving the final deliverable.

**Outcome:** Defined a human-in-the-loop workflow that separates AI-generated implementation from independent quality verification.

## 2. Master Prompt — Role, Scope & Engineering Standards

Objective: Establish the technical role, challenge requirements, quality expectations, and execution criteria.

Prompt (Spanish):

Actúa como un Senior QA Automation Engineer especializado en Playwright,
TypeScript y E2E testing.

vamos a resolver el challenge de Nuaav sobre SauceDemo
(https://www.saucedemo.com), utilizando el documento adjunto como fuente
principal de requisitos.

Objetivo: entregar una solución profesional, mantenible, confiable y
reproducible, cumpliendo todos los requisitos y bonus Lead, sin
sobreingeniería.

Antes de implementar:

- Analiza los requisitos, la aplicación y el proyecto existente.
- Identifica ambigüedades, restricciones y riesgos técnicos.
- Define una arquitectura adecuada y justifica las decisiones relevantes.

Utiliza TypeScript, locators resilientes, assertions significativas
y sincronización basada en condiciones. Evita sleeps innecesarios,
duplicación y abstracciones injustificadas.

Documenta la arquitectura, instalación, ejecución, decisiones técnicas,
limitaciones y uso de IA en README.md y llm-prompts.md.

Trabaja directamente sobre el proyecto, reutiliza lo que sea válido,
ejecuta las validaciones disponibles y corrige los problemas reales.

Toma decisiones técnicas autónomas y fundamentadas. No inventes
resultados ni afirmes validaciones que no hayas ejecutado.

Resultado esperado: un repositorio reproducible, profesional y
defendible técnicamente en una evaluación de QA Automation.

English summary: Defined the Senior QA Automation role, challenge scope, architecture, quality standards, Lead bonus, documentation, execution requirements, and evidence-based validation rules.
