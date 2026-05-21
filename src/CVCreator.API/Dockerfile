FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY CVCreator.slnx .
COPY src/CVCreator.Domain/CVCreator.Domain.csproj src/CVCreator.Domain/
COPY src/CVCreator.Application/CVCreator.Application.csproj src/CVCreator.Application/
COPY src/CVCreator.Infrastructure/CVCreator.Infrastructure.csproj src/CVCreator.Infrastructure/
COPY src/CVCreator.API/CVCreator.API.csproj src/CVCreator.API/
RUN dotnet restore src/CVCreator.API/CVCreator.API.csproj
COPY . .
RUN dotnet publish src/CVCreator.API/CVCreator.API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
# Install Google Chrome stable (ubuntu 24.04 ships chromium as a snap shim — use Google's repo instead)
RUN apt-get update && apt-get install -y wget gnupg ca-certificates --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub \
       | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' \
       > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "CVCreator.API.dll"]
