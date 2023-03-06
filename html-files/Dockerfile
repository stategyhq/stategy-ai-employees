FROM php:7.4-apache

# Copy project files to the container
COPY . /var/www/html/

# Set up API key
RUN echo "<?php\n\$API_KEY = 'sk-OPENAI-KEY-HERE';" > /var/www/html/api_key.php

# Set the server name
RUN echo "ServerName ai-chatbot.stategy.ca" >> /etc/apache2/apache2.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start the Apache server in the foreground
CMD ["apache2ctl", "-D", "FOREGROUND"]
