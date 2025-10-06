set -ex

npm run build
export AWS_PROFILE=mmj


aws s3 rm s3://aixs-anshin-hitsuji-admin/assets --recursive
aws s3 sync ./dist s3://aixs-anshin-hitsuji-admin/

# rsync -avz --exclude node_modules/  /home/kazu/workspace/smartdm/ office:workspace/smartdm2/

aws cloudfront create-invalidation --distribution-id E1JFZ0XT2GGKAK --invalidation "{
    \"Paths\": {
        \"Quantity\": 1,
        \"Items\": [
            \"/*\"
        ]
    },
    \"CallerReference\": \"$(date +%s)\"
}"

