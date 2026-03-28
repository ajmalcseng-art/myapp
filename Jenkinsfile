pipeline {
    agent any
    
    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO = '376903139062.dkr.ecr.ap-south-1.amazonaws.com/myapp'
        ECS_CLUSTER = 'myapp-clusterr'
        ECS_SERVICE = 'myapp-service'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'GITHUB_TOKEN',
                    url: 'https://github.com/ajmalcseng-art/myapp'
            }
        }
	 stage('Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }
        
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${ECR_REPO}:${IMAGE_TAG} .'
            }
        }
        
        stage('Push to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO}
                        docker push ${ECR_REPO}:${IMAGE_TAG}
                    '''
                }
            }
        }
        
        stage('Deploy to ECS') {
    steps {
        withCredentials([
            string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
            sh '''
                # Update task definition with new image
                TASK_DEF=$(aws ecs describe-task-definition --task-definition myapp-task --region ${AWS_REGION})
                NEW_TASK_DEF=$(echo $TASK_DEF | python3 -c "
		import json,sys
		t=json.load(sys.stdin)['taskDefinition']
		t['containerDefinitions'][0]['image']='${ECR_REPO}:${IMAGE_TAG}'
		print(json.dumps({k:t[k] for k in ['family','containerDefinitions','requiresCompatibilities','networkMode','cpu','memory']}))
		")
                NEW_REVISION=$(aws ecs register-task-definition --region ${AWS_REGION} --cli-input-json "$NEW_TASK_DEF" | python3 -c "import json,sys; print(sys.stdin.read())" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['taskDefinition']['family']+':'+str(d['taskDefinition']['revision']))")
	         aws ecs update-service \
                    --cluster ${ECS_CLUSTER} \
                    --service ${ECS_SERVICE} \
                    --task-definition $NEW_REVISION \
                    --force-new-deployment \
                    --region ${AWS_REGION}
            '''
       	 }
   	 }
			}
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
