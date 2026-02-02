pipeline {
    agent any

    tools {
        // These must match your 'Manage Jenkins > Tools' exactly
        maven 'Maven4'
        jdk 'jdk21'
    }

    triggers {
        // Checks GitHub for new code every 1 minute
        pollSCM('* * * * *')
        
        // Keeps the pipeline ready for instant Webhook pushes
        githubPush() 
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls the latest code from your procter_app repo
                checkout scm
            }
        }
        stage('Build & Package') {
            steps {
                echo 'Building with Maven 4 and JDK 21...'
                // Builds the Java backend in the /server folder
                sh 'mvn -f server/pom.xml clean install -DskipTests'
            }
        }
        stage('Test') {
            steps {
                echo 'Running Server Tests...'
                sh 'mvn -f server/pom.xml test'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Build and Test completed.'
        }
        failure {
            echo 'FAILURE: Check the logs for errors.'
        }
    }
}
