import { createFileRoute } from "@tanstack/react-router";
import { Separator, Text } from "@stellar-ui-kit/web";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyComponent,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <Text as="h2" className="text-lg font-semibold">
        {title}
      </Text>
      <div className="flex flex-col gap-2 text-sm text-muted">{children}</div>
    </section>
  );
}

function PrivacyComponent() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <Text as="h1" className="text-3xl font-semibold tracking-tight">
          {t("privacyTitle")}
        </Text>
        <Text as="p" className="text-sm text-muted">
          {t("privacyLastUpdated")}
        </Text>
      </div>

      <Separator />

      <Section title={t("privacySection1Title")}>
        <Text as="p">{t("privacySection1Body")}</Text>
      </Section>

      <Section title={t("privacySection2Title")}>
        <Text as="p">{t("privacySection2Intro")}</Text>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong className="text-foreground">
              {t("privacySection2ItemAccountTitle")}
            </strong>{" "}
            {t("privacySection2ItemAccountDesc")}
          </li>
          <li>
            <strong className="text-foreground">
              {t("privacySection2ItemContentTitle")}
            </strong>{" "}
            {t("privacySection2ItemContentDesc")}
          </li>
          <li>
            <strong className="text-foreground">
              {t("privacySection2ItemUsageTitle")}
            </strong>{" "}
            {t("privacySection2ItemUsageDesc")}
          </li>
        </ul>
        <Text as="p">{t("privacySection2Note")}</Text>
      </Section>

      <Section title={t("privacySection3Title")}>
        <Text as="p">{t("privacySection3Intro")}</Text>
        <ul className="ml-4 list-disc space-y-1">
          <li>{t("privacySection3ItemAuth")}</li>
          <li>{t("privacySection3ItemSync")}</li>
          <li>{t("privacySection3ItemStats")}</li>
        </ul>
        <Text as="p">{t("privacySection3Note")}</Text>
      </Section>

      <Section title={t("privacySection4Title")}>
        <Text as="p">{t("privacySection4Body")}</Text>
      </Section>

      <Section title={t("privacySection5Title")}>
        <Text as="p">{t("privacySection5Intro")}</Text>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong className="text-foreground">
              {t("privacySection5ItemAccessTitle")}
            </strong>{" "}
            {t("privacySection5ItemAccessDesc")}
          </li>
          <li>
            <strong className="text-foreground">
              {t("privacySection5ItemCorrectionTitle")}
            </strong>{" "}
            {t("privacySection5ItemCorrectionDesc")}
          </li>
          <li>
            <strong className="text-foreground">
              {t("privacySection5ItemDeletionTitle")}
            </strong>{" "}
            {t("privacySection5ItemDeletionDesc")}
          </li>
          <li>
            <strong className="text-foreground">
              {t("privacySection5ItemPortabilityTitle")}
            </strong>{" "}
            {t("privacySection5ItemPortabilityDesc")}
          </li>
          <li>
            <strong className="text-foreground">
              {t("privacySection5ItemCcpaTitle")}
            </strong>{" "}
            {t("privacySection5ItemCcpaDesc")}
          </li>
        </ul>
      </Section>

      <Section title={t("privacySection6Title")}>
        <Text as="p">{t("privacySection6Body")}</Text>
      </Section>

      <Section title={t("privacySection7Title")}>
        <Text as="p">{t("privacySection7Body")}</Text>
      </Section>

      <Section title={t("privacySection8Title")}>
        <Text as="p">{t("privacySection8Body")}</Text>
      </Section>

      <Section title={t("privacySection9Title")}>
        <Text as="p">
          {t("privacySection9Body")}{" "}
          <a
            href="mailto:privacy@thinkcards.app"
            className="text-primary underline underline-offset-2"
          >
            privacy@thinkcards.app
          </a>
          .
        </Text>
      </Section>
    </div>
  );
}
