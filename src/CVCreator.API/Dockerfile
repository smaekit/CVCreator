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
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "CVCreator.API.dll"]
