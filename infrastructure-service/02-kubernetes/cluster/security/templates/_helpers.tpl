{{/*
Expand the name of the chart.
*/}}
{{- define "security.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "security.labels" -}}
helm.sh/chart: {{ include "security.name" . }}-{{ .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ include "security.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Trivy image
*/}}
{{- define "security.trivy.image" -}}
{{- printf "%s:%s" .Values.trivy.image.repository .Values.trivy.image.tag }}
{{- end }}

