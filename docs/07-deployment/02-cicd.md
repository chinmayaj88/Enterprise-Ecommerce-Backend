<div align="center">

# 🔄 07.2 - CI/CD Pipelines

[![CI/CD](https://img.shields.io/badge/CI%2FCD-Pipelines-blue?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-green?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Automation](https://img.shields.io/badge/Automation-Complete-orange?style=flat-square)](.)

**Each service has its own CI/CD pipeline in its repository**

</div>

---

## Pipeline Structure

Each service directory contains:

```
<service-name>/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Continuous Integration
│       └── cd.yml          # Continuous Deployment
└── ...
```

## CI Pipeline (Continuous Integration)

### Purpose

- Run tests on every commit
- Build Docker images
- Check code quality
- Validate configuration

### Example CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
      
      - name: Build
        run: npm run build
      
      - name: Build Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY_URL }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
```

## CD Pipeline (Continuous Deployment)

### Purpose

- Deploy to staging on merge to `develop`
- Deploy to production on merge to `main`
- Run integration tests
- Health checks

### Example CD Workflow

```yaml
# .github/workflows/cd.yml
name: CD

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure OCI CLI
        uses: oracle-actions/setup-oci-cli@v1
        with:
          cli-version: latest
      
      - name: Configure kubectl
        run: |
          oci ce cluster create-kubeconfig \
            --cluster-id ${{ secrets.CLUSTER_ID }} \
            --region ${{ secrets.OCI_REGION }} \
            --file $HOME/.kube/config
      
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY_URL }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY_URL }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
      
      - name: Deploy to staging
        run: |
          helm upgrade --install ${{ env.SERVICE_NAME }} \
            ./infrastructure-service/02-kubernetes/services/${{ env.SERVICE_NAME }} \
            -f values-staging.yaml \
            --set image.tag=${{ github.sha }} \
            --namespace ${{ env.SERVICE_NAME }}-staging
      
      - name: Run health checks
        run: |
          kubectl wait --for=condition=available \
            --timeout=300s \
            deployment/${{ env.SERVICE_NAME }} \
            -n ${{ env.SERVICE_NAME }}-staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: []
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure OCI CLI
        uses: oracle-actions/setup-oci-cli@v1
      
      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.REGISTRY_URL }}/${{ env.SERVICE_NAME }}:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY_URL }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
      
      - name: Deploy to production
        run: |
          helm upgrade --install ${{ env.SERVICE_NAME }} \
            ./infrastructure-service/02-kubernetes/services/${{ env.SERVICE_NAME }} \
            -f values-prod.yaml \
            --set image.tag=${{ github.sha }} \
            --namespace ${{ env.SERVICE_NAME }}-prod
      
      - name: Run health checks
        run: |
          kubectl wait --for=condition=available \
            --timeout=300s \
            deployment/${{ env.SERVICE_NAME }} \
            -n ${{ env.SERVICE_NAME }}-prod
```

## Required Secrets

Configure these secrets in GitHub repository settings:

- `REGISTRY_URL`: OCI Container Registry URL
- `CLUSTER_ID`: OKE Cluster OCID
- `OCI_REGION`: OCI Region
- `OCI_TENANCY_OCID`: OCI Tenancy OCID
- `OCI_USER_OCID`: OCI User OCID
- `OCI_FINGERPRINT`: OCI API Key Fingerprint
- `OCI_PRIVATE_KEY`: OCI API Private Key

## Environment Variables

Set environment variables in workflow:

```yaml
env:
  SERVICE_NAME: auth-service
  NODE_ENV: production
```

## Best Practices

### CI/CD ✅

- ✅ Run tests on every commit
- ✅ Build Docker images in CI
- ✅ Deploy to staging automatically
- ✅ Require approval for production
- ✅ Run health checks after deployment
- ✅ Rollback on failure

### Security ✅

- ✅ Use secrets for sensitive data
- ✅ Scan container images
- ✅ Use least privilege IAM
- ✅ Rotate credentials regularly

### Monitoring ✅

- ✅ Monitor deployment status
- ✅ Alert on failures
- ✅ Track deployment metrics
- ✅ Log all deployments

## Troubleshooting

### Pipeline Fails

1. Check workflow logs in GitHub Actions
2. Verify secrets are configured
3. Check service dependencies
4. Verify infrastructure is accessible

### Deployment Fails

1. Check Kubernetes cluster access
2. Verify Helm chart is valid
3. Check resource limits
4. Review pod logs

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Deployment](./03-kubernetes.md)

---

**Next:** [Kubernetes Deployment](./03-kubernetes.md)

