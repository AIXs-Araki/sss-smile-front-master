set -ex

npm run build
export AWS_PROFILE=mmj


aws s3 rm s3://aixs-anshin-hitsuji-pc/assets --recursive
aws s3 sync ./dist s3://aixs-anshin-hitsuji-pc/

# rsync -avz --exclude node_modules/  /home/kazu/workspace/smartdm/ office:workspace/smartdm2/

aws cloudfront create-invalidation --distribution-id E241K51UUKFTRO --invalidation "{
    \"Paths\": {
        \"Quantity\": 1,
        \"Items\": [
            \"/*\"
        ]
    },
    \"CallerReference\": \"$(date +%s)\"
}"

