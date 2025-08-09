# Cron Job Setup for BikfayaList

## Required Cron Jobs

### 1. Monthly Reset Job

To automatically reset user free listing limits each month, set up a cron job to call:

### Endpoint
```
POST https://bikfayalist.com/api/cron/monthly-reset
```

### Headers
```
Authorization: Bearer YOUR_CRON_SECRET_TOKEN
Content-Type: application/json
```

### Environment Variable
Add to your `.env`:
```
CRON_SECRET_TOKEN=your-secure-random-token-here
```

### 2. Featured Listings Expiration Job

To automatically expire featured listings and clean up add-ons, set up an hourly cron job:

#### Endpoint
```
POST https://bikfayalist.com/api/cron/expire-featured
```

#### Headers (same as above)
```
Authorization: Bearer YOUR_CRON_SECRET_TOKEN
Content-Type: application/json
```

## Setup Options

### 1. GitHub Actions (Recommended)

Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Scheduled Maintenance Jobs
on:
  schedule:
    # Monthly reset: Run on the 1st of every month at 00:00 UTC
    - cron: '0 0 1 * *'
    # Featured expiration: Run every hour
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual triggers
    inputs:
      job_type:
        description: 'Job type to run'
        required: true
        default: 'both'
        type: choice
        options:
        - monthly-reset
        - expire-featured
        - both

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Run Monthly Reset
        if: github.event_name == 'schedule' && github.event.schedule == '0 0 1 * *' || github.event.inputs.job_type == 'monthly-reset' || github.event.inputs.job_type == 'both'
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}" \
            -H "Content-Type: application/json" \
            "https://bikfayalist.com/api/cron/monthly-reset"
      
      - name: Run Featured Expiration
        if: github.event_name == 'schedule' && github.event.schedule == '0 * * * *' || github.event.inputs.job_type == 'expire-featured' || github.event.inputs.job_type == 'both'
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}" \
            -H "Content-Type: application/json" \
            "https://bikfayalist.com/api/cron/expire-featured"
```

Add `CRON_SECRET_TOKEN` to your GitHub repository secrets.

### 2. Netlify Functions
Create `netlify/functions/monthly-reset.js`:

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  
  const response = await fetch('https://bikfayalist.com/api/cron/monthly-reset', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
  
  return {
    statusCode: response.status,
    body: await response.text()
  }
}
```

### 3. External Cron Services
- **Cron-job.org**: Free service, schedule monthly calls
- **EasyCron**: More features, schedule complex jobs
- **GitHub Actions**: Built-in, reliable, free

## Monitoring

Check reset status:
```bash
GET https://bikfayalist.com/api/cron/monthly-reset
```

This returns:
- Users needing reset
- Average free listings used
- Next scheduled reset date
- System health

## Manual Reset

For testing or emergency resets, you can call the endpoint manually or use the workflow_dispatch trigger in GitHub Actions.